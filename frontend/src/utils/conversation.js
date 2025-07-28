import api from './axios';

export const saveConversation = async (payload) => {
  try {
    const response = await api.post('/therapist/save-history', payload);
    return response.data;
  } catch (error) {
    console.error('Error saving conversation:', error);
    return null;
  }
};

export const getConversationHistory = async (user_id) => {
  try {
    const response = await api.get(`/therapist/get-history/${user_id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
};
