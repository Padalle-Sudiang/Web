import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  Download, 
  AlertCircle, 
  Settings, 
  RotateCcw,
  Monitor,
  Circle,
  Square,
  Loader2,
  Eye,
  Maximize2,
  Volume2,
  VolumeX
} from 'lucide-react';

const LiveStreamMonitor = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureStatus, setCaptureStatus] = useState('');
  const [streamStatus, setStreamStatus] = useState('online');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [captureHistory, setCaptureHistory] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('camera1');
  
  const baseUrl = 'http://10.2.3.78:5000';
  const videoStreamUrl = `${baseUrl}/video_feed`;
  
  // Available cameras
  const cameras = [
    { id: 'camera1', name: 'Camera 1 - Main Gate', status: 'online' },
    { id: 'camera2', name: 'Camera 2 - Parking Area', status: 'online' },
    { id: 'camera3', name: 'Camera 3 - Side Entrance', status: 'offline' }
  ];

  const handleCapture = async () => {
    setIsCapturing(true);
    setCaptureStatus('Capturing...');

    try {
      const response = await fetch(`${baseUrl}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        mode: 'cors',
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          console.log('Capture result (JSON):', result);
        } else {
          const text = await response.text();
          console.warn('Capture result (non-JSON):', text);
        }

        // Add to capture history
        const newCapture = {
          id: Date.now(),
          timestamp: new Date().toLocaleString('id-ID'),
          camera: selectedCamera,
          status: 'success'
        };
        setCaptureHistory(prev => [newCapture, ...prev.slice(0, 4)]);
        
        setCaptureStatus('Capture berhasil!');
        setTimeout(() => setCaptureStatus(''), 3000);
      } else {
        const errorText = await response.text();
        setCaptureStatus(`Capture gagal: ${response.status}`);
        console.error('Response error:', errorText);
      }
    } catch (error) {
      setCaptureStatus('Error: ' + error.message);
      console.error('Capture error:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRefreshStream = () => {
    setStreamStatus('connecting');
    setTimeout(() => {
      setStreamStatus('online');
    }, 2000);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Live Stream Monitor
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={handleRefreshStream}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stream Status */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              streamStatus === 'online' ? 'bg-green-500 animate-pulse' : 
              streamStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
              'bg-red-500'
            }`}></div>
            <span className="font-medium text-gray-900">
              Status: {streamStatus === 'online' ? 'Online' : streamStatus === 'connecting' ? 'Connecting...' : 'Offline'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {new Date().toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Video Stream - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Video Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Live Camera Feed</h3>
                    <p className="text-blue-100 text-sm">{cameras.find(c => c.id === selectedCamera)?.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">LIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Container */}
            <div className="p-6">
              <div className="relative bg-black rounded-xl overflow-hidden">
                {streamStatus === 'connecting' ? (
                  <div className="w-full h-80 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                      <p>Connecting to stream...</p>
                    </div>
                  </div>
                ) : streamStatus === 'online' ? (
                  <img
                    src={videoStreamUrl}
                    alt="Live Stream"
                    className="w-full h-80 object-cover"
                    onError={(e) => {
                      console.log('Stream error, retrying...');
                      setStreamStatus('offline');
                    }}
                  />
                ) : (
                  <div className="w-full h-80 flex items-center justify-center">
                    <div className="text-center text-white">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                      <p>Stream Offline</p>
                      <button 
                        onClick={handleRefreshStream}
                        className="mt-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Retry Connection
                      </button>
                    </div>
                  </div>
                )}

                {/* Video Controls Overlay */}
                {streamStatus === 'online' && (
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
                      <div className="flex items-center space-x-2">
                        <Circle className="w-3 h-3 text-red-500 fill-current" />
                        <span>REC</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={toggleMute}
                        className="p-2 bg-black/70 backdrop-blur-sm rounded-lg text-white hover:bg-black/80 transition-colors"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={toggleFullscreen}
                        className="p-2 bg-black/70 backdrop-blur-sm rounded-lg text-white hover:bg-black/80 transition-colors"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleCapture}
                  disabled={isCapturing || streamStatus !== 'online'}
                  className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all ${
                    isCapturing || streamStatus !== 'online'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-105'
                  }`}
                >
                  {isCapturing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Capturing...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mr-2" />
                      Capture Screenshot
                    </>
                  )}
                </button>

                {/* Status Message */}
                {captureStatus && (
                  <div className={`flex items-center px-4 py-3 rounded-xl ${
                    captureStatus.includes('berhasil') 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : captureStatus.includes('Error') || captureStatus.includes('gagal')
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{captureStatus}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Camera Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Camera Selection</h3>
            <div className="space-y-3">
              {cameras.map((camera) => (
                <button
                  key={camera.id}
                  onClick={() => setSelectedCamera(camera.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    selectedCamera === camera.id
                      ? 'bg-blue-100 border-2 border-blue-500 text-blue-900'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Monitor className="w-5 h-5" />
                    <span className="font-medium text-sm">{camera.name}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    camera.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                </button>
              ))}
            </div>
          </div>

          {/* Stream Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stream Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Resolution</span>
                <span className="font-medium">1920x1080</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Frame Rate</span>
                <span className="font-medium">30 FPS</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Format</span>
                <span className="font-medium">H.264</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bitrate</span>
                <span className="font-medium">2.5 Mbps</span>
              </div>
            </div>
          </div>

          {/* Recent Captures */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Captures</h3>
            {captureHistory.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No captures yet</p>
            ) : (
              <div className="space-y-3">
                {captureHistory.map((capture) => (
                  <div key={capture.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Camera className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{capture.timestamp}</p>
                        <p className="text-xs text-gray-600">{cameras.find(c => c.id === capture.camera)?.name}</p>
                      </div>
                    </div>
                    <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamMonitor;