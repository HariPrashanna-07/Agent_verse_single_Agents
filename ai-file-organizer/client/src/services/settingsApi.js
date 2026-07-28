import api from './api';

export const getSettingsApi = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSettingsApi = async (settingsData) => {
  const response = await api.put('/settings', settingsData);
  return response.data;
};
