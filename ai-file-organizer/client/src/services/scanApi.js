import api from './api';

export const scanFolderApi = async (formData, onUploadProgress) => {
  const response = await api.post('/scan', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    }
  });
  return response.data;
};

export const generatePreviewApi = async (scanId) => {
  const response = await api.post('/preview', { scanId });
  return response.data;
};
