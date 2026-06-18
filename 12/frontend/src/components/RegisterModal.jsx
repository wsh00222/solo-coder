import React from 'react';
import { Modal, Form, Input, Button } from 'antd';

export default function RegisterModal({ open, isFull, onCancel, onSubmit, submitting }) {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (err) {}
  };

  return (
    <Modal
      title="活动报名"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="submit" type="primary" loading={submitting} onClick={handleSubmit} disabled={isFull}>
          {isFull ? '名额已满' : '确认报名'}
        </Button>
      ]}
    >
      {isFull ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#ff4d4f' }}>
          😢 该活动报名人数已满，无法报名
        </div>
      ) : (
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入您的姓名" />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
          ]}>
            <Input placeholder="请输入11位手机号" maxLength={11} />
          </Form.Item>
          <Form.Item name="email" label="邮箱（可选）" rules={[{ type: 'email', message: '请输入正确的邮箱' }]}>
            <Input placeholder="请输入邮箱（选填）" />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
