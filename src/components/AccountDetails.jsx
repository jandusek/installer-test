import React, { Component } from 'react';
import { Button, Input, Space, Typography, Popover } from 'antd';
import { RightOutlined } from '@ant-design/icons';
const { Text } = Typography;

class AccountDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accountSid: undefined,
      authToken: undefined,
      instanceName: 'Twilio Phone Client'
    };
  }

  onChange(field, event) {
    this.setState({ [field]: event.target.value });
  }

  onSubmit() {
    this.props.socket.send(
      JSON.stringify({
        action: 'auth',
        accountSid: this.state.accountSid,
        authToken: this.state.authToken,
        instanceName: this.state.instanceName
      })
    );
  }

  render() {
    return (
      <div>
        <Space
          direction="vertical"
          style={{ width: '320px', padding: '0 20px' }}
        >
          <Text>Please insert your Account details:</Text>
          <Popover
            placement="right"
            title="Account SID & Auth Token"
            content={
              <div>
                <p>
                  You can get these in the{' '}
                  <a href="https://www.twilio.com/console">
                    Twilio Console Dashboard
                  </a>
                  .
                </p>
                <p>
                  Installer needs these so it can perform actions on your
                  <br />
                  account, namely to create the services this application
                  <br />
                  needs to function.
                </p>
              </div>
            }
          >
            <Input
              placeholder="Account SID"
              value={this.state.accountSid || ''}
              onChange={this.onChange.bind(this, 'accountSid')}
              onPressEnter={this.onSubmit.bind(this)}
            />
            <Input.Password
              placeholder="Auth Token"
              value={this.state.authToken || ''}
              onChange={this.onChange.bind(this, 'authToken')}
              onPressEnter={this.onSubmit.bind(this)}
            />
          </Popover>
          <div style={{ marginTop: '2vh' }}>
            <Text>Instance Name:</Text>
          </div>
          <Popover
            placement="right"
            title="Instance Name"
            content={
              <div>
                <p>Select some name - an arbitrary string.</p>
                <p>
                  It will be used as a Service Name for the new
                  <br />
                  services that need to be created and a name
                  <br />
                  prefix for other resources that will be created
                  <br />
                  (e.g. Studio Flow).
                </p>
                <p>
                  If you are reinstalling an existing deployment,
                  <br />
                  make sure you provide the same Instance Name <br />
                  as during the initial installation.
                </p>
              </div>
            }
          >
            <Input
              placeholder="Instance Name"
              value={this.state.instanceName || ''}
              onChange={this.onChange.bind(this, 'instanceName')}
              onPressEnter={this.onSubmit.bind(this)}
            />
          </Popover>

          <Button
            type="primary"
            style={{ marginLeft: 8, marginTop: '2vh' }}
            onClick={this.onSubmit.bind(this)}
          >
            Next
            <RightOutlined />
          </Button>
        </Space>
      </div>
    );
  }
}

export default AccountDetails;
