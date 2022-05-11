import React, {FunctionComponent} from 'react';
import './App.css';
import {BrowserRouter as Router, Navigate} from "react-router-dom";
import {Route, Routes} from "react-router";

import Login from "views/Login";
import Home from "views/Home"
import Auth from 'views/Auth';
import DummyAuth from 'views/DummyAuth';
import { useGetConnectedQuery } from 'store/api';
import LogoutView from 'views/LogoutView';

const App: FunctionComponent = () => {
  const { data: connected, isLoading } = useGetConnectedQuery();

  if (isLoading)
    return <></>;

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/dummy/:name" element={<DummyAuth />} />
        <Route path="/logout" element={<LogoutView />} />
        {connected ?
          <Route path="/*" element={<Home />} /> :
          <Route path="/*" element={<Login />} />
        }
      </Routes>
    </Router>
  );
};

export default App;
