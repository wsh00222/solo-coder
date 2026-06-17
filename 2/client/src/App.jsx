import React, { useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu, Typography } from 'antd';
import SurveyList from './pages/SurveyList.jsx';
import CreateSurvey from './pages/CreateSurvey.jsx';
import FillSurvey from './pages/FillSurvey.jsx';
import Statistics from './pages/Statistics.jsx';
import { useAlert } from './context/AlertContext.jsx';
import { setAlertRef } from './api/request.js';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const alert = useAlert();

  useEffect(() => {
    setAlertRef(alert);
  }, [alert]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#001529' }}>
        <Title level={3} style={{ color: '#fff', margin: 0, marginRight: 40 }}>
          📋 在线问卷调查
        </Title>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['1']}
          style={{ flex: 1, minWidth: 0 }}
          items={[
            { key: '1', label: <Link to="/">问卷列表</Link> },
            { key: '2', label: <Link to="/create">创建问卷</Link> }
          ]}
        />
      </Header>
      <Content style={{ padding: 24 }}>
        <Routes>
          <Route path="/" element={<SurveyList />} />
          <Route path="/create" element={<CreateSurvey />} />
          <Route path="/edit/:id" element={<CreateSurvey />} />
          <Route path="/fill/:id" element={<FillSurvey />} />
          <Route path="/statistics/:id" element={<Statistics />} />
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
