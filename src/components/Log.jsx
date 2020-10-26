import React from 'react';
import { Typography } from 'antd';
import { CheckOutlined, CopyTwoTone } from '@ant-design/icons';
const { Paragraph } = Typography;

function Log(props) {
  let cnt = 0;
  return (
    <div style={{ paddingTop: '3vh' }}>
      {props.items.map((i) => {
        console.log('i:', i);
        for (const key in i) {
          return (
            <div key={cnt++}>
              <Paragraph strong style={{ marginBottom: 0 }}>
                {key}
              </Paragraph>
              <Paragraph
                copyable={{
                  icon: [
                    <CopyTwoTone />,
                    <CheckOutlined style={{ color: '#565B73' }} />
                  ]
                }}
              >
                {i[key]}
              </Paragraph>
            </div>
          );
        }
      })}
    </div>
  );
}

export default Log;
