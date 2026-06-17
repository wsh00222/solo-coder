import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Switch,
  Space,
  Typography,
  Divider,
  message
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { api } from '../api/request.js';
import { useAlert } from '../context/AlertContext.jsx';

const { Title } = Typography;
const { TextArea } = Input;

const QUESTION_TYPES = [
  { value: 'single', label: '单选题' },
  { value: 'multiple', label: '多选题' },
  { value: 'text', label: '文本题' }
];

function CreateSurvey() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess } = useAlert();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;

  const questions = Form.useWatch('questions', form) || [];

  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const survey = await api.getSurvey(id);
          if (survey.published) {
            message.error('已发布问卷不允许编辑');
            navigate('/');
            return;
          }
          form.setFieldsValue({
            title: survey.title,
            description: survey.description,
            anonymous: survey.anonymous,
            questions: survey.questions
          });
        } catch (e) {
          navigate('/');
        }
      })();
    } else {
      form.setFieldsValue({
        anonymous: true,
        questions: [
          { type: 'single', title: '', required: true, options: ['', ''] },
          { type: 'text', title: '', required: true }
        ]
      });
    }
  }, [id]);

  const handleTypeChange = (qIndex, newType) => {
    const currentQuestions = form.getFieldValue('questions') || [];
    const q = { ...currentQuestions[qIndex], type: newType };
    if ((newType === 'single' || newType === 'multiple') && (!q.options || q.options.length === 0)) {
      q.options = ['', ''];
    }
    currentQuestions[qIndex] = q;
    form.setFieldsValue({ questions: currentQuestions });
  };

  const addQuestion = () => {
    const currentQuestions = form.getFieldValue('questions') || [];
    currentQuestions.push({ type: 'single', title: '', required: true, options: ['', ''] });
    form.setFieldsValue({ questions: currentQuestions });
  };

  const removeQuestion = (index) => {
    const currentQuestions = form.getFieldValue('questions') || [];
    if (currentQuestions.length <= 2) {
      message.warning('至少保留2个题目');
      return;
    }
    currentQuestions.splice(index, 1);
    form.setFieldsValue({ questions: currentQuestions });
  };

  const addOption = (qIndex) => {
    const currentQuestions = form.getFieldValue('questions') || [];
    currentQuestions[qIndex].options = currentQuestions[qIndex].options || [];
    currentQuestions[qIndex].options.push('');
    form.setFieldsValue({ questions: currentQuestions });
  };

  const removeOption = (qIndex, oIndex) => {
    const currentQuestions = form.getFieldValue('questions') || [];
    if (currentQuestions[qIndex].options.length <= 2) {
      message.warning('至少保留2个选项');
      return;
    }
    currentQuestions[qIndex].options.splice(oIndex, 1);
    form.setFieldsValue({ questions: currentQuestions });
  };

  const handleSubmit = async (values) => {
    for (let i = 0; i < values.questions.length; i++) {
      const q = values.questions[i];
      if (!q.title || !q.title.trim()) {
        message.error(`第${i + 1}题题干不能为空`);
        return;
      }
      if ((q.type === 'single' || q.type === 'multiple')) {
        if (!q.options || q.options.length < 2) {
          message.error(`第${i + 1}题选项至少2个`);
          return;
        }
        for (let j = 0; j < q.options.length; j++) {
          if (!q.options[j] || !q.options[j].trim()) {
            message.error(`第${i + 1}题第${j + 1}个选项不能为空`);
            return;
          }
        }
      }
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.updateSurvey(id, values);
        showSuccess('修改成功');
      } else {
        await api.createSurvey(values);
        showSuccess('创建成功');
      }
      navigate('/');
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
      <Card>
        <Title level={4}>{isEdit ? '编辑问卷' : '创建问卷'}</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ anonymous: true }}
        >
          <Form.Item
            label="问卷标题"
            name="title"
            rules={[{ required: true, message: '请输入问卷标题' }]}
          >
            <Input placeholder="请输入问卷标题" maxLength={100} />
          </Form.Item>

          <Form.Item label="问卷描述" name="description">
            <TextArea placeholder="请输入问卷描述" rows={3} maxLength={500} />
          </Form.Item>

          <Form.Item label="匿名回答" name="anonymous" valuePropName="checked">
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>

          <Divider orientation="left">题目设置</Divider>

          <Form.List name="questions">
            {() => (
              <div>
                {questions.map((q, qIndex) => (
                  <Card
                    key={qIndex}
                    size="small"
                    style={{ marginBottom: 16, background: '#fafafa' }}
                    title={`第 ${qIndex + 1} 题`}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeQuestion(qIndex)}
                      >
                        删除此题
                      </Button>
                    }
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space style={{ width: '100%' }} wrap>
                        <Form.Item
                          name={[qIndex, 'type']}
                          label="题目类型"
                          style={{ marginBottom: 0, minWidth: 140 }}
                        >
                          <Select
                            options={QUESTION_TYPES}
                            onChange={(val) => handleTypeChange(qIndex, val)}
                          />
                        </Form.Item>
                        <Form.Item
                          name={[qIndex, 'required']}
                          label="必填"
                          valuePropName="checked"
                          style={{ marginBottom: 0 }}
                        >
                          <Switch />
                        </Form.Item>
                      </Space>

                      <Form.Item
                        name={[qIndex, 'title']}
                        label="题干"
                        rules={[{ required: true, message: '请输入题干' }]}
                        style={{ marginBottom: 8 }}
                      >
                        <Input placeholder="请输入题干" maxLength={200} />
                      </Form.Item>

                      {(q?.type === 'single' || q?.type === 'multiple') && (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          {(q?.options || []).map((_, oIndex) => (
                            <Space key={oIndex} style={{ width: '100%' }}>
                              <span style={{ width: 24, textAlign: 'right' }}>{oIndex + 1}.</span>
                              <Form.Item
                                name={[qIndex, 'options', oIndex]}
                                rules={[{ required: true, message: '请输入选项内容' }]}
                                style={{ flex: 1, marginBottom: 8 }}
                              >
                                <Input placeholder="请输入选项内容" maxLength={100} />
                              </Form.Item>
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => removeOption(qIndex, oIndex)}
                              />
                            </Space>
                          ))}
                          <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => addOption(qIndex)}
                            style={{ width: 'fit-content' }}
                          >
                            添加选项
                          </Button>
                        </Space>
                      )}
                    </Space>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addQuestion}
                  style={{ width: '100%' }}
                >
                  添加题目
                </Button>
              </div>
            )}
          </Form.List>

          <Divider />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? '保存修改' : '创建问卷'}
              </Button>
              <Button onClick={() => navigate('/')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default CreateSurvey;
