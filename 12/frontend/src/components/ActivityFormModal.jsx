import React from 'react';
import { Modal, Form, Input, DatePicker, InputNumber, Button } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function ActivityFormModal({ open, initialData, onCancel, onSubmit, submitting }) {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          title: initialData.title,
          activity_time: dayjs(initialData.activity_time),
          location: initialData.location,
          registration_deadline: dayjs(initialData.registration_deadline),
          max_participants: initialData.max_participants,
          description: initialData.description
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        title: values.title,
        activity_time: values.activity_time.format('YYYY-MM-DD HH:mm:ss'),
        location: values.location,
        registration_deadline: values.registration_deadline.format('YYYY-MM-DD HH:mm:ss'),
        max_participants: values.max_participants,
        description: values.description
      };
      onSubmit(data);
    } catch (err) {}
  };

  return (
    <Modal
      title={initialData ? '编辑活动' : '创建活动'}
      open={open}
      onCancel={onCancel}
      width={640}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="submit" type="primary" loading={submitting} onClick={handleSubmit}>
          {initialData ? '保存修改' : '创建活动'}
        </Button>
      ]}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="title" label="活动标题" rules={[{ required: true, message: '请输入活动标题' }]}>
          <Input placeholder="请输入活动标题" />
        </Form.Item>
        <Form.Item name="activity_time" label="活动时间" rules={[{ required: true, message: '请选择活动时间' }]}>
          <DatePicker showTime style={{ width: '100%' }} placeholder="选择活动时间" format="YYYY-MM-DD HH:mm" />
        </Form.Item>
        <Form.Item name="location" label="活动地点" rules={[{ required: true, message: '请输入活动地点' }]}>
          <Input placeholder="请输入活动地点" />
        </Form.Item>
        <Form.Item name="registration_deadline" label="报名截止时间" rules={[{ required: true, message: '请选择报名截止时间' }]}>
          <DatePicker showTime style={{ width: '100%' }} placeholder="选择报名截止时间" format="YYYY-MM-DD HH:mm" />
        </Form.Item>
        <Form.Item name="max_participants" label="最大参与人数" rules={[{ required: true, message: '请输入最大参与人数' }]}>
          <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入最大参与人数" />
        </Form.Item>
        <Form.Item name="description" label="活动描述">
          <TextArea rows={4} placeholder="请输入活动描述（可选）" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
