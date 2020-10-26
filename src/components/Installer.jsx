import React, { Component } from 'react';
import { Layout } from 'antd';
import ProgressBar from './ProgressBar';
import Log from './Log';
import AccountDetails from './AccountDetails';
import { CloudDownloadOutlined } from '@ant-design/icons';
import { Typography, Spin, Alert } from 'antd';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

const { Title } = Typography;

const { Footer, Sider, Content } = Layout;

class Installer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      status: 'process',
      log: [],
      wsState: 'closed',
      error: ''
    };
    this.updateProgress = this.updateProgress.bind(this);
    this.updateLog = this.updateLog.bind(this);
    this.connectSocket = this.connectSocket.bind(this);
    this.processMessage = this.processMessage.bind(this);
  }

  connectSocket() {
    //const HOST = window.location.origin.toString().replace(/^http/, 'ws');
    const HOST = 'ws://localhost:3001';
    console.log('HOST:', HOST);
    this.socket = new W3CWebSocket(HOST);
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.setState({ wsState: 'established' });
    };
    this.socket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      this.processMessage(data);
    };
    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.setState({ wsState: 'closed' });
      setTimeout(() => {
        this.connectSocket();
      }, 3000);
    };
    this.socket.onerror = (err) => {
      console.error('Socket encountered error:', err, 'Closing socket');
      this.socket.close();
    };
  }

  processMessage(data) {
    console.log('Processing:', data);
    if (data.type === 'stepUpdate') {
      if (data.step) {
        this.updateProgress(data.step, data.success ? 'process' : 'error');
      }
      if (data.msgs) {
        this.updateLog(data.msgs);
      }
      if (data.error) {
        this.setState({ error: data.error });
      } else {
        // reset errors if there were any
        if (this.state.error) {
          this.setState({ error: undefined });
        }
      }
    }
  }

  componentWillMount() {
    this.connectSocket();
  }

  /**
   * updateProgress
   * @param {*} step - Step to move to
   * @param {*} result - Status to set [process|wait|finish|error]
   */
  updateProgress(step, result = 'process') {
    console.log('Updating progress:', step, result);
    this.setState({ step, status: result });
  }

  updateLog(newItems) {
    const log = this.state.log;
    if (Array.isArray(newItems)) {
      log.push(...newItems);
      this.setState({ log });
    } else {
      console.error('Received non-array input:', newItems);
    }
  }

  render() {
    return (
      <div style={{ height: '100vh' }}>
        <Layout style={{ paddingTop: '5vh', height: '95vh' }}>
          <Content>
            <CloudDownloadOutlined style={{ fontSize: '50px' }} />
            <Title level={2} style={{ marginBottom: '0.1em' }}>
              Twilio Phone Client
            </Title>
            <Title
              level={3}
              style={{ color: '#008CFF', margin: 0, padding: '0 0 3vh' }}
            >
              Installer
            </Title>
            {this.state.error && (
              <Alert
                message={this.state.error.header}
                description={this.state.error.body}
                type="error"
                showIcon
              />
            )}
            <Log items={this.state.log} />
            {this.state.step === 0 && this.state.wsState === 'established' && (
              <AccountDetails
                updateProgress={this.updateProgress}
                updateLog={this.updateLog}
                socket={this.socket}
              />
            )}
            {this.state.step === 0 && this.state.wsState !== 'established' && (
              <Spin size="large" style={{ paddingTop: '2vh' }} />
            )}
            {this.state.step === 1 && (
              <Spin size="large" style={{ paddingTop: '2vh' }} />
            )}
          </Content>
          <Sider theme="light" width="300px" style={{ padding: '30px' }}>
            <ProgressBar step={this.state.step} status={this.state.status} />
          </Sider>
        </Layout>
        <Footer style={{ height: '5vh', padding: '0' }}></Footer>
      </div>
    );
  }
}

export default Installer;
