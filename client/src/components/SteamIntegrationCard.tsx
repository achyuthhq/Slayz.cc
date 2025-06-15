import React from 'react';
import { Card, Avatar, Typography, Space, Statistic, Button } from 'antd';
import { SteamOutlined, GamepadOutlined, LinkOutlined } from '@ant-design/icons';
import { User, hasSteamConnected, toSteamUser } from '../types/user';
import SteamConnectButton from './SteamConnectButton';

const { Title, Text } = Typography;

interface SteamIntegrationCardProps {
  user: User;
  onUpdate?: () => void;
}

const SteamIntegrationCard: React.FC<SteamIntegrationCardProps> = ({ user, onUpdate }) => {
  const isConnected = hasSteamConnected(user);
  const steamUser = isConnected ? toSteamUser(user) : null;

  const handleConnect = (steamData: any) => {
    if (onUpdate) {
      onUpdate();
    }
  };

  const handleDisconnect = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <Card
      title={
        <Space>
          <SteamOutlined style={{ fontSize: '1.5em', color: '#1b2838' }} />
          <span>Steam Integration</span>
        </Space>
      }
      extra={
        <SteamConnectButton 
          user={user} 
          onConnect={handleConnect} 
          onDisconnect={handleDisconnect}
        />
      }
      style={{ marginBottom: 24 }}
    >
      {isConnected && steamUser ? (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ marginRight: 24, marginBottom: 16 }}>
            <Avatar 
              size={96} 
              src={steamUser.avatarfull} 
              alt={steamUser.personaname}
              style={{ border: '2px solid #1b2838' }}
            />
          </div>
          
          <div style={{ flex: 1, minWidth: 200 }}>
            <Title level={4} style={{ margin: 0 }}>
              {steamUser.personaname}
            </Title>
            
            <Space direction="vertical" style={{ marginTop: 8 }}>
              <Text type="secondary">
                Steam ID: {steamUser.steamid}
              </Text>
              
              <Space>
                <Statistic 
                  title="Games" 
                  value={steamUser.gamesCount || 0} 
                  prefix={<GamepadOutlined />} 
                  style={{ marginRight: 24 }}
                />
              </Space>
              
              <Button 
                type="link" 
                icon={<LinkOutlined />}
                href={steamUser.profileurl} 
                target="_blank"
                style={{ paddingLeft: 0 }}
              >
                View Steam Profile
              </Button>
            </Space>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <SteamOutlined style={{ fontSize: '3em', color: '#8c8c8c', marginBottom: 16 }} />
          <Title level={5} style={{ margin: 0, marginBottom: 16 }}>
            No Steam Account Connected
          </Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
            Connect your Steam account to display your games and profile information on your Slayz.cc profile.
          </Text>
        </div>
      )}
    </Card>
  );
};

export default SteamIntegrationCard; 