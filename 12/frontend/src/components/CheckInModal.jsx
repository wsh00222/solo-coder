import React, { useState } from 'react';
import { Modal, Form, Input, Button } from 'antd';

export default function CheckInModal({ open, onCancel, onSubmit, submitting }) {
  const [form] = Form.useForm();
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (open) {
      form.resetFields();
      setSuccess(false);
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSuccess(true);
      setTimeout(() => {
        onSubmit(values.phone);
      }, 1200);
    } catch (err) {}
  };

  return (
    <Modal
      title="活动签到"
      open={open}
      onCancel={success ? undefined : onCancel}
      closable={!success}
      maskClosable={!success}
      footer={success ? null : [
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="submit" type="primary" loading={submitting} onClick={handleSubmit}>确认签到</Button>
      ]}
    >
      {success ? (
        <div className="success-animation" style={{ padding: '24px 0' }}>
          <span className="checkmark-icon">✓</span>
          <span style={{ fontSize: 16 }}>签到成功！</span>
        </div>
      ) : (
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="phone" label="报名手机号" rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
          ]}>
            <Input placeholder="请输入报名时填写的手机号" maxLength={11} />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
