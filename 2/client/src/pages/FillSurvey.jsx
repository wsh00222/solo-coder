import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Radio,
  Checkbox,
  Typography,
  Space,
  Result
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { api } from '../api/request.js';
import { useAlert } from '../context/AlertContext.jsx';

const { Title, Paragraph } = Typography;

function FillSurvey() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess } = useAlert();
  const [survey, setSurvey] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getSurvey(id);
        if (!data.published) {
          setSurvey({ error: '问卷未发布，无法填写' });
          return;
        }
        setSurvey(data);
      } catch (e) {
        setSurvey({ error: '问卷不存在' });
      }
    })();
  }, [id]);

  if (!survey) {
    return <div style={{ textAlign: 'center', padding: 50 }}>加载中...</div>;
  }

  if (survey.error) {
    return (
      <Card style={{ maxWidth: 600, margin: '50px auto' }}>
        <Result status="warning" title={survey.error} extra={
          <Button type="primary" onClick={() => navigate('/')}>返回首页</Button>
        } />
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card style={{ maxWidth: 600, margin: '50px auto' }}>
        <Result
          status="success"
          title="提交成功"
          subTitle="感谢您的参与！"
          extra={[
            <Button type="primary" key="back" onClick={() => navigate('/')}>
              返回首页
            </Button>
          ]}
        />
      </Card>
    );
  }

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const answers = {};
      survey.questions.forEach((q, idx) => {
        answers[q.id] = values[`q_${idx}`];
      });
      await api.submitResponse({
        surveyId: id,
        respondentName: values.respondentName,
        answers
      });
      showSuccess('提交成功');
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/')}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>
      <Card style={{ maxWidth: 800, margin: '0 auto' }}>
        <Title level={3} style={{ marginTop: 0 }}>{survey.title}</Title>
        {survey.description && (
          <Paragraph type="secondary">{survey.description}</Paragraph>
        )}
        {!survey.anonymous && (
          <Paragraph type="warning" style={{ marginBottom: 24 }}>
            此问卷为实名填写，请如实填写您的姓名
          </Paragraph>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {!survey.anonymous && (
            <Form.Item
              label="您的姓名"
              name="respondentName"
              rules={[{ required: true, message: '请填写您的姓名' }]}
            >
              <Input placeholder="请输入您的姓名" maxLength={50} />
            </Form.Item>
          )}

          {survey.questions.map((q, idx) => (
            <Form.Item
              key={q.id}
              label={
                <Space>
                  <span style={{ fontWeight: 500 }}>
                    {idx + 1}. {q.title}
                  </span>
                  {q.required && <span style={{ color: '#ff4d4f' }}>*</span>}
                </Space>
              }
              name={`q_${idx}`}
              rules={
                q.required
                  ? [
                      {
                        validator: (_, value) => {
                          if (q.type === 'text') {
                            if (value === undefined || value === null || String(value).trim() === '') {
                              return Promise.reject(new Error('此项为必填'));
                            }
                          } else if (q.type === 'single') {
                            if (value === undefined || value === null || value === '') {
                              return Promise.reject(new Error('请选择一个选项'));
                            }
                          } else if (q.type === 'multiple') {
                            if (!Array.isArray(value) || value.length === 0) {
                              return Promise.reject(new Error('请至少选择一个选项'));
                            }
                          }
                          return Promise.resolve();
                        }
                      }
                    ]
                  : []
              }
            >
              {q.type === 'single' && (
                <Radio.Group>
                  <Space direction="vertical">
                    {q.options.map((opt, oIdx) => (
                      <Radio key={oIdx} value={opt}>{opt}</Radio>
                    ))}
                  </Space>
                </Radio.Group>
              )}
              {q.type === 'multiple' && (
                <Checkbox.Group style={{ width: '100%' }}>
                  <Space direction="vertical">
                    {q.options.map((opt, oIdx) => (
                      <Checkbox key={oIdx} value={opt}>{opt}</Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              )}
              {q.type === 'text' && (
                <Input.TextArea
                  placeholder="请输入您的回答"
                  rows={4}
                  maxLength={1000}
                  showCount
                />
              )}
            </Form.Item>
          ))}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                提交
              </Button>
              <Button onClick={() => navigate('/')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default FillSurvey;
