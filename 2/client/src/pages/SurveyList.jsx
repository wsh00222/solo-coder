import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Statistic, Tag, Popconfirm, Space, Typography, Empty } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BarChartOutlined,
  FormOutlined,
  SendOutlined,
  StopOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { api } from '../api/request.js';
import { useAlert } from '../context/AlertContext.jsx';

const { Title, Text } = Typography;

function SurveyList() {
  const navigate = useNavigate();
  const { showSuccess } = useAlert();
  const [surveys, setSurveys] = useState([]);
  const [stats, setStats] = useState({ total: 0, publishedCount: 0, recoveryRate: '0%' });
  const [deletingId, setDeletingId] = useState(null);

  const loadData = async () => {
    const [list, s] = await Promise.all([api.getSurveys(), api.getSurveyStats()]);
    setSurveys(list);
    setStats(s);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    setTimeout(async () => {
      await api.deleteSurvey(id);
      showSuccess('删除成功');
      setDeletingId(null);
      loadData();
    }, 300);
  };

  const handlePublish = async (id) => {
    await api.publishSurvey(id);
    showSuccess('操作成功');
    loadData();
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总问卷数" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已发布问卷数" value={stats.publishedCount} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="总回答数" value={stats.totalResponses || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="回收率" value={stats.recoveryRate} />
          </Card>
        </Col>
      </Row>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>问卷列表</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/create')}>
          创建问卷
        </Button>
      </div>

      {surveys.length === 0 ? (
        <Empty description="暂无问卷，点击上方按钮创建" />
      ) : (
        <Row gutter={[16, 16]}>
          {surveys.map(s => (
            <Col span={8} key={s.id}>
              <Card
                className={deletingId === s.id ? 'fade-out' : ''}
                hoverable
                actions={[
                  <Button
                    key="fill"
                    type="link"
                    icon={<FormOutlined />}
                    disabled={!s.published}
                    onClick={() => navigate(`/fill/${s.id}`)}
                  >
                    填写
                  </Button>,
                  <Button
                    key="stats"
                    type="link"
                    icon={<BarChartOutlined />}
                    onClick={() => navigate(`/statistics/${s.id}`)}
                  >
                    统计
                  </Button>,
                  <Button
                    key="edit"
                    type="link"
                    icon={<EditOutlined />}
                    disabled={s.published}
                    onClick={() => navigate(`/edit/${s.id}`)}
                  >
                    编辑
                  </Button>,
                  s.published ? (
                    <Popconfirm
                      key="unpublish"
                      title="确定要关闭此问卷吗？关闭后用户将无法填写"
                      onConfirm={() => handlePublish(s.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button type="link" danger icon={<StopOutlined />}>
                        关闭
                      </Button>
                    </Popconfirm>
                  ) : (
                    <Popconfirm
                      key="publish"
                      title="确定要发布此问卷吗？发布后将无法编辑和删除"
                      onConfirm={() => handlePublish(s.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button type="link" icon={<SendOutlined />}>
                        发布
                      </Button>
                    </Popconfirm>
                  ),
                  <Popconfirm
                    key="delete"
                    title="确定要删除此问卷吗？该问卷的所有回答数据也将被清除，且不可恢复。"
                    onConfirm={() => handleDelete(s.id)}
                    okText="确定删除"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                    disabled={s.published}
                  >
                    <Button type="link" danger icon={<DeleteOutlined />} disabled={s.published}>
                      删除
                    </Button>
                  </Popconfirm>
                ]}
              >
                <Card.Meta
                  title={
                    <Space>
                      <span>{s.title}</span>
                      {s.published ? (
                        <Tag color="green">已发布</Tag>
                      ) : (
                        <Tag color="default">未发布</Tag>
                      )}
                      {s.anonymous ? (
                        <Tag color="blue">匿名</Tag>
                      ) : (
                        <Tag color="orange">实名</Tag>
                      )}
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                        {s.description || '暂无描述'}
                      </Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">
                          创建时间：{dayjs(s.createdAt).format('YYYY-MM-DD HH:mm')}
                        </Text>
                        <Text type="secondary">回答：{s.responseCount} 份</Text>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

export default SurveyList;
