import axios from './auth';

// Example API calls for collaboration features

// 1. Fetch all users (excluding current user)
export const fetchAllUsers = async () => {
  try {
    const response = await axios.get('/api/users/profiles');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.msg || 'Failed to fetch users');
  }
};

// 2. Fetch logged-in user's projects
export const fetchMyProjects = async () => {
  try {
    const response = await axios.get('/api/projects/my');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.msg || 'Failed to fetch projects');
  }
};

// 3. Send collaboration request
export const sendCollaborationRequest = async (requestData) => {
  try {
    const response = await axios.post('/api/collaborations/request', {
      requesterId: requestData.requesterId,
      targetUserId: requestData.targetUserId,
      targetProjectId: requestData.targetProjectId,
      message: requestData.message
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.msg || 'Failed to send collaboration request');
  }
};

// 4. Fetch incoming collaboration requests
export const fetchIncomingRequests = async () => {
  try {
    const response = await axios.get('/api/collaborations/incoming');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.msg || 'Failed to fetch incoming requests');
  }
};

// 5. Accept collaboration request
export const acceptCollaborationRequest = async (requestId) => {
  try {
    const response = await axios.put(`/api/collaborations/request/${requestId}/accept`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.msg || 'Failed to accept request');
  }
};

// 6. Reject collaboration request
export const rejectCollaborationRequest = async (requestId) => {
  try {
    const response = await axios.put(`/api/collaborations/request/${requestId}/reject`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.msg || 'Failed to reject request');
  }
};

// 7. Fetch collaborative projects
export const fetchCollaborativeProjects = async () => {
  try {
    const response = await axios.get('/api/collaborations/projects');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.msg || 'Failed to fetch collaborative projects');
  }
};

// Example usage:
/*
// In a React component:

import { 
  fetchAllUsers, 
  fetchMyProjects, 
  sendCollaborationRequest,
  acceptCollaborationRequest,
  rejectCollaborationRequest,
  fetchCollaborativeProjects
} from '../utils/collaborationAPI';

const CollaborationComponent = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [collabProjects, setCollabProjects] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, projectsData, collabData] = await Promise.all([
          fetchAllUsers(),
          fetchMyProjects(),
          fetchCollaborativeProjects()
        ]);
        setUsers(usersData);
        setProjects(projectsData);
        setCollabProjects(collabData);
      } catch (error) {
        console.error('Error loading data:', error.message);
      }
    };
    
    loadData();
  }, []);

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptCollaborationRequest(requestId);
      alert('Request accepted successfully!');
      // Refresh data
      const collabData = await fetchCollaborativeProjects();
      setCollabProjects(collabData);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await rejectCollaborationRequest(requestId);
      alert('Request rejected');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    // Your component JSX
  );
};
*/