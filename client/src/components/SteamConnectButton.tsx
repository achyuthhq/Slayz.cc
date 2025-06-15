import React, { useState } from 'react';
import axios from 'axios';
import { Button, Input, Modal, Form, message } from 'antd';
import { SteamOutlined, LoadingOutlined, LinkOutlined, DisconnectOutlined } from '@ant-design/icons';
import { User, hasSteamConnected } from '../types/user';

interface SteamConnectButtonProps {
  user: User;
  onConnect?: (steamUser: any) => void;
  onDisconnect?: () => void;
}

const SteamConnectButton: React.FC<SteamConnectButtonProps> = ({ user, onConnect, onDisconnect }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [steamUrl, setSteamUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const isConnected = hasSteamConnected(user);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const extractSteamId = (url: string): string | null => {
    // Handle different Steam URL formats
    try {
      // Format: https://steamcommunity.com/id/username/
      if (url.includes('/id/')) {
        const username = url.split('/id/')[1].split('/')[0];
        // We would need to make an API call to convert username to steamID64
        // This is a simplified version - in production, you'd need to use the Steam API
        message.error('Please use your Steam profile URL with your Steam ID (steamcommunity.com/profiles/...)');
        return null;
      }
      
      // Format: https://steamcommunity.com/profiles/76561198012345678/
      if (url.includes('/profiles/')) {
        const steamId = url.split('/profiles/')[1].split('/')[0];
        return steamId;
      }
      
      // If it's just the Steam ID
      if (/^[0-9]{17}$/.test(url)) {
        return url;
      }
      
      message.error('Invalid Steam URL format. Please use your profile URL (steamcommunity.com/profiles/...)');
      return null;
    } catch (error) {
      message.error('Could not extract Steam ID from URL');
      return null;
    }
  };

  const handleConnect = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      const steamId = extractSteamId(values.steamUrl);
      
      if (!steamId) {
        return;
      }
      
      setIsLoading(true);
      
      const response = await axios.post('/api/auth/steam/connect', { steamId });
      
      if (response.data.success) {
        message.success('Steam account connected successfully');
        setIsModalVisible(false);
        form.resetFields();
        
        if (onConnect) {
          onConnect(response.data.steamUser);
        }
        
        // Reload the page to update the user data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error connecting Steam account:', error);
      message.error('Failed to connect Steam account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      
      const response = await axios.post('/api/auth/steam/disconnect');
      
      if (response.data.success) {
        message.success('Steam account disconnected successfully');
        
        if (onDisconnect) {
          onDisconnect();
        }
        
        // Reload the page to update the user data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error disconnecting Steam account:', error);
      message.error('Failed to disconnect Steam account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isConnected ? (
        <Button 
          icon={<DisconnectOutlined />} 
          danger
          onClick={handleDisconnect}
          loading={isLoading}
        >
          Disconnect Steam
        </Button>
      ) : (
        <Button 
          type="primary" 
          icon={<SteamOutlined />} 
          onClick={showModal}
          style={{ backgroundColor: '#171a21', borderColor: '#171a21' }}
        >
          Connect Steam
        </Button>
      )}
      
      <Modal
        title="Connect Steam Account"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button 
            key="connect" 
            type="primary" 
            onClick={handleConnect} 
            loading={isLoading}
            style={{ backgroundColor: '#171a21', borderColor: '#171a21' }}
          >
            Connect
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <p>Please enter your Steam profile URL to connect your account:</p>
          <p style={{ fontSize: '0.9em', color: '#888' }}>
            Example: https://steamcommunity.com/profiles/76561198012345678/
          </p>
        </div>
        
        <Form form={form} layout="vertical">
          <Form.Item
            name="steamUrl"
            rules={[{ required: true, message: 'Please enter your Steam profile URL' }]}
          >
            <Input 
              prefix={<LinkOutlined />} 
              placeholder="Steam Profile URL" 
              onChange={(e) => setSteamUrl(e.target.value)}
            />
          </Form.Item>
          
          <div style={{ fontSize: '0.9em', marginTop: 16 }}>
            <p>How to find your Steam profile URL:</p>
            <ol>
              <li>Open Steam or go to steamcommunity.com</li>
              <li>Click on your profile name</li>
              <li>Copy the URL from your browser's address bar</li>
            </ol>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default SteamConnectButton; 