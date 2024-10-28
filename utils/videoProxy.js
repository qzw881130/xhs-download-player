import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';

const VIDEOS_DIRECTORY = FileSystem.documentDirectory + 'videos/';

// 确保视频目录存在
const ensureDirectoryExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(VIDEOS_DIRECTORY);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(VIDEOS_DIRECTORY, { intermediates: true });
    }
};

// 检查文件系统权限和可用空间
const checkFileSystemAccess = async () => {
    try {
        // 检查权限
        const { status } = await MediaLibrary.getPermissionsAsync();
        if (status !== 'granted') {
            const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
            if (newStatus !== 'granted') {
                console.error('Storage permission not granted');
                return false;
            }
        }

        // 检查可用空间
        try {
            const { freeDiskStorage, totalDiskCapacity } = await FileSystem.getFreeDiskStorageAsync();
            const freeSpaceInMB = freeDiskStorage / (1024 * 1024);
            if (!isNaN(freeSpaceInMB)) {
                console.log(`Free space: ${freeSpaceInMB.toFixed(2)} MB`);
                if (freeSpaceInMB < 100) { // 假设我们需要至少100MB的可用空间
                    console.error('Not enough free space');
                    return false;
                }
            } else {
                console.warn('Unable to determine free disk space. Proceeding with caution.');
            }
        } catch (spaceError) {
            console.warn('Error checking free disk space:', spaceError);
            console.warn('Proceeding without space check.');
        }

        return true;
    } catch (error) {
        console.error('Error checking file system access:', error);
        return false;
    }
};

// 下载视频
const downloadVideo = async (url, vid, onProgress) => {
    await ensureDirectoryExists();

    if (!(await checkFileSystemAccess())) {
        console.warn('File system access check failed, but proceeding with download attempt');
    }

    // Add a 200 second delay before starting the download
    // console.log('Delaying download for 200 seconds...');
    // await new Promise(resolve => setTimeout(resolve, 200000));
    // console.log('Delay complete. Starting download...');

    const fileName = `${vid}.mp4`;
    const fileUri = VIDEOS_DIRECTORY + fileName;

    // Delete any existing file
    await FileSystem.deleteAsync(fileUri, { idempotent: true });

    try {
        console.log('Starting download from URL:', url);
        const proxyUrl = `https://woouwxrgdkgxobbikbdj.supabase.co/functions/v1/proxyDownload?videoUrl=` + encodeURIComponent(url);
        console.log('proxyUrl===', proxyUrl);

        let totalBytes = 0;
        let lastReportedProgress = 0;

        const downloadResumable = FileSystem.createDownloadResumable(
            proxyUrl,
            fileUri,
            {},
            (downloadProgress) => {
                const { totalBytesWritten, totalBytesExpectedToWrite } = downloadProgress;
                console.log(`Bytes written: ${totalBytesWritten}, Expected: ${totalBytesExpectedToWrite}`);

                totalBytes = Math.max(totalBytes, totalBytesWritten);

                if (totalBytesExpectedToWrite > 0) {
                    const progress = (totalBytesWritten / totalBytesExpectedToWrite) * 100;
                    console.log(`Download progress: ${progress.toFixed(2)}%`);
                    if (onProgress) {
                        onProgress(progress);
                    }
                } else {
                    // 当 totalBytesExpectedToWrite 为 -1 时，我们使用一个估计的进度
                    const estimatedProgress = (totalBytesWritten / (totalBytes + 1000000)) * 100;
                    if (estimatedProgress - lastReportedProgress >= 1 || estimatedProgress >= 100) {
                        console.log(`Estimated download progress: ${estimatedProgress.toFixed(2)}%`);
                        if (onProgress) {
                            onProgress(Math.min(estimatedProgress, 100));
                        }
                        lastReportedProgress = estimatedProgress;
                    }
                }
            }
        );

        const result = await downloadResumable.downloadAsync();
        if (result && result.uri) {
            const fileInfo = await FileSystem.getInfoAsync(result.uri);
            const fileSizeInBytes = fileInfo.size;
            const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
            console.log('Video downloaded to:', result.uri, 'target=', url, 'size==', `${fileSizeInMB} MB`);

            if (fileSizeInBytes === 0) {
                throw new Error('Downloaded file is empty');
            }

            await AsyncStorage.setItem(`video_${vid}`, result.uri);
            return result.uri;
        } else {
            throw new Error('Download failed: No URI returned');
        }
    } catch (error) {
        console.error('Error downloading video:', error);
        if (error.message.includes('403')) {
            console.error('Access forbidden. The server may be blocking the request.');
        } else if (error.message.includes('404')) {
            console.error('Video not found. The URL may be invalid or the video has been removed.');
        }
        // Attempt to read file content for more information
        try {
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (fileInfo.exists) {
                const fileContent = await FileSystem.readAsStringAsync(fileUri);
                console.log('File content:', fileContent.substring(0, 1000)); // Print first 1000 characters
            } else {
                console.log('File does not exist after download attempt');
            }
        } catch (readError) {
            console.error('Error reading file:', readError);
        }
        return null;
    }
};

// 获取视频地址
export const getVideoUrl = async (vid, remoteUrl) => {
    const localUri = await AsyncStorage.getItem(`video_${vid}`);
    if (localUri) {
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        if (fileInfo.exists) {
            console.log('Using local video:', localUri);
            return localUri;
        }
    }

    // 如果本地没有，返回远程 URL
    return remoteUrl;
};

// 处理视频加载失败
export const handleVideoLoadError = async (vid, remoteUrl, onProgress) => {
    console.log('Video load failed, attempting to download:', remoteUrl);
    // 删除可能存在的损坏文件
    const fileUri = VIDEOS_DIRECTORY + `${vid}.mp4`;
    // Check if local video exists
    const localVideoUri = await AsyncStorage.getItem(`video_${vid}`);
    if (localVideoUri) {
        const fileInfo = await FileSystem.getInfoAsync(localVideoUri);
        if (fileInfo.exists && fileInfo.size > 0) {
            console.log('Using existing local video:', localVideoUri);
            return localVideoUri;
        }
    }
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
    await AsyncStorage.removeItem(`video_${vid}`);

    const localUri = await downloadVideo(remoteUrl, vid, onProgress);
    if (localUri) {
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        console.log('Downloaded file info:', fileInfo);
        return localUri;
    }
    console.log('Download failed, returning remote URL:', remoteUrl);
    return remoteUrl; // 如果下载失败，返回远程 URL
};

// 新增：计算缓存大小
export const getCacheSize = async () => {
    try {
        const result = await FileSystem.getInfoAsync(VIDEOS_DIRECTORY);
        if (result.exists && result.isDirectory) {
            const contents = await FileSystem.readDirectoryAsync(VIDEOS_DIRECTORY);
            let totalSize = 0;
            for (const item of contents) {
                const fileInfo = await FileSystem.getInfoAsync(VIDEOS_DIRECTORY + item);
                if (fileInfo.exists && !fileInfo.isDirectory) {
                    totalSize += fileInfo.size;
                }
            }
            return (totalSize / (1024 * 1024)).toFixed(2); // 返回 MB，保留两位小数
        }
        return '0';
    } catch (error) {
        console.error('Error calculating cache size:', error);
        return '0';
    }
};

// 新增：清除缓存
export const clearCache = async () => {
    try {
        await FileSystem.deleteAsync(VIDEOS_DIRECTORY, { idempotent: true });
        await FileSystem.makeDirectoryAsync(VIDEOS_DIRECTORY, { intermediates: true });
        return true;
    } catch (error) {
        console.error('Error clearing cache:', error);
        return false;
    }
};