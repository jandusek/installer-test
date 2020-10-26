import React from 'react';
import { Steps } from 'antd';
const { Step } = Steps;

export default function ProgressBar(props) {
  return (
    <Steps
      direction="vertical"
      size="small"
      current={props.step}
      status={props.status}
    >
      <Step title="Collect Inputs" description="Account details" />
      <Step title="Setup Sync" description="Configuration store" />
      <Step title="Create API Keys" description="Replace account credentials" />
      <Step
        title="Setup Autopilot"
        description="Chatbot to instill personality"
      />
      <Step title="Setup Studio" description="Flex IVR" />
    </Steps>
  );
}
