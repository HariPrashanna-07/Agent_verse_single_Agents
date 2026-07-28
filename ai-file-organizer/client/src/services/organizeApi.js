import api from './api';

export const organizeFilesApi = async (scanId, approvedFiles) => {
  const response = await api.post('/organize', { scanId, approvedFiles });
  return response.data;
};

export const undoScanApi = async (scanId) => {
  const response = await api.post('/undo', { scanId });
  return response.data;
};
