import { api } from './api';

function isAxiosError(error) {
  return typeof error === 'object' && error !== null && error.isAxiosError === true;
}

export const uploadProposalAttachments = async (proposalId, files, descriptions = []) => {
  if (!proposalId || isNaN(parseInt(proposalId, 10))) {
    return Promise.reject(new Error("Valid Proposal ID is required for upload."));
  }
  
  if (!files || files.length === 0) {
    return Promise.reject(new Error("At least one file is required."));
  }

  const formData = new FormData();
  
  // Add files
  files.forEach(file => {
    formData.append('files', file);
  });
  
  // Add descriptions
  descriptions.forEach(desc => {
    formData.append('descriptions', desc || '');
  });

  try {
    const response = await api.post(`/fileupload/proposal/${proposalId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to upload attachments for proposal ${proposalId}:`, error);
    let errorMessage = 'Dogodila se greška prilikom učitavanja datoteka.';
    if (isAxiosError(error)) {
      if (error.response?.status === 403) { 
        errorMessage = "Nemate ovlasti za dodavanje priloga ovom natječaju."; 
      } else if (error.response?.status === 404) { 
        errorMessage = "Natječaj nije pronađen."; 
      } else if (error.response?.data) { 
        errorMessage = error.response.data.message || error.response.data.title || JSON.stringify(error.response.data); 
      }
    }
    throw new Error(errorMessage);
  }
};

export const fetchProposalAttachments = async (proposalId) => {
  if (!proposalId || isNaN(parseInt(proposalId, 10))) {
    return Promise.reject(new Error("Valid Proposal ID is required."));
  }

  try {
    const response = await api.get(`/proposalattachments/proposal/${proposalId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch attachments for proposal ${proposalId}:`, error);
    let errorMessage = 'Dogodila se greška prilikom dohvaćanja priloga.';
    if (isAxiosError(error)) {
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.title || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Nije moguće uspostaviti vezu sa serverom.';
      }
    }
    throw new Error(errorMessage);
  }
};

export const deleteProposalAttachment = async (attachmentId) => {
  if (!attachmentId || isNaN(parseInt(attachmentId, 10))) {
    return Promise.reject(new Error("Valid Attachment ID is required for deletion."));
  }

  try {
    await api.delete(`/proposalattachments/${attachmentId}`);
  } catch (error) {
    console.error(`Failed to delete attachment ${attachmentId}:`, error);
    let errorMessage = 'Dogodila se greška prilikom brisanja priloga.';
    if (isAxiosError(error)) {
      if (error.response?.status === 403) { 
        errorMessage = "Nemate ovlasti za brisanje ovog priloga."; 
      } else if (error.response?.status === 404) { 
        errorMessage = "Prilog nije pronađen."; 
      } else if (error.response?.data) { 
        errorMessage = error.response.data.message || error.response.data.title || JSON.stringify(error.response.data); 
      }
    }
    throw new Error(errorMessage);
  }
};