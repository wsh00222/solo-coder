import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  List,
  Empty,
  Tag,
  Statistic,
  Row,
  Col,
  Space
} from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { Column } from '@ant-design/charts';
import { api } from '../api/request.js';

const { Title, Paragraph, Text } = Typography;

function Statistics() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const result = await api.getStatistics(id);
      setData(result);
    })();
  }, [id]);

  if (!data) {
    return <div style={{ textAlign: 'center', padding: 50 }}>加载中...</div>;
  }

  const { survey, totalResponses, questionStats } = data;

  const renderChart = (stat) => {
    const chartData = stat.options.map(opt => ({
      选项: opt,
      票数: stat.counts[opt] || 0
    }));

    const config = {
      data: chartData,
      xField: '选项',
      yField: '票数',
      label: {
        position: 'middle',
        style: {
          fill: '#000',
          opacity: 0.6
        },
        formatter: (val, item) => {
          const count = stat.counts[item['选项']] || 0;
          const percent = stat.total > 0 ? ((count / stat.total) * 100).toFixed(1) : 0;
          return `${count} (${percent}%)`;
        }
      },
      columnWidthRatio: 0.5,
      meta: {
        选项: { alias: '选项' },
        票数: { alias: '票数' }
      },
      color: '#1890ff',
      tooltip: {
        fields: ['选项', '票数']
      }
    };

    return <Column {...config} />;
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
      <Card style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Title level={3} style={{ marginTop: 0 }}>{survey.title}</Title>
        {survey.description && (
          <Paragraph type="secondary">{survey.description}</Paragraph>
        )}

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card size="small">
              <Statistic title="总回答数" value={totalResponses} />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="问卷状态"
                value={survey.published ? '已发布' : '未发布'}
                valueStyle={{ color: survey.published ? '#52c41a' : '#999' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="回答方式"
                value={survey.anonymous ? '匿名' : '实名'}
              />
            </Card>
          </Col>
        </Row>

        {questionStats.map((stat, idx) => (
          <Card
            key={stat.questionId}
            style={{ marginBottom: 16 }}
            title={
              <Space>
                <span>
                  {idx + 1}. {stat.title}
                </span>
                <Tag color={stat.type === 'single' ? 'blue' : stat.type === 'multiple' ? 'purple' : 'green'}>
                  {stat.type === 'single' ? '单选题' : stat.type === 'multiple' ? '多选题' : '文本题'}
                </Tag>
              </Space>
            }
          >
            {stat.type === 'text' ? (
              stat.answers && stat.answers.length > 0 ? (
                <List
                  dataSource={stat.answers}
                  renderItem={(item, i) => (
                    <List.Item key={i}>
                      <List.Item.Meta
                        avatar={!survey.anonymous && item.respondentName ? <UserOutlined /> : null}
                        title={!survey.anonymous && item.respondentName ? item.respondentName : '匿名用户'}
                        description={<Text>{item.text}</Text>}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无文本回答" />
              )
            ) : (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary">
                    {stat.type === 'single' ? '总投票数' : '总选择次数'}：{stat.total}
                  </Text>
                </div>
                {stat.total > 0 ? (
                  <div style={{ height: 300 }}>
                    {renderChart(stat)}
                  </div>
                ) : (
                  <Empty description="暂无数据" />
                )}
                <div style={{ marginTop: 16 }}>
                  {stat.options.map((opt, oIdx) => {
                    const count = stat.counts[opt] || 0;
                    const percent = stat.total > 0 ? ((count / stat.total) * 100).toFixed(1) : 0;
                    return (
                      <div key={oIdx} style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                        <Text style={{ width: 200, flexShrink: 0 }}>{opt}</Text>
                        <div
                          style={{
                            flex: 1,
                            height: 8,
                            background: '#f0f0f0',
                            borderRadius: 4,
                            overflow: 'hidden',
                            marginRight: 8
                          }}
                        >
                          <div
                            style={{
                              width: `${percent}%`,
                              height: '100%',
                              background: '#1890ff',
                              transition: 'width 0.3s'
                            }}
                          />
                        </div>
                        <Text type="secondary" style={{ width: 100, textAlign: 'right' }}>
                          {count} 票 ({percent}%)
                        </Text>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        ))}
      </Card>
    </div>
  );
}

export default Statistics;
