import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "bootstrap";
import Auth from "./views/Auth";
import AuthContextProvider from "./contexts/AuthContext";
import Dashboard from "./views/Dashboard";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import About from "./views/About";
import AboutAuthor from "./views/AboutAuthor";
import Device from "./views/Device";
import Statistics from "./views/Statistics";
import DataContextProvider from "./contexts/DataContext";
import StatusContextProvider from "./contexts/StatusContext";
import TypeContextProvider from "./contexts/TypeContext";
import TotalVolumeContextProvider from "./contexts/TotalVolumeContext";
import SetVolumeContextProvider from "./contexts/SetVolumeContext";
import Setting from "./views/Setting";
import ConfigContextProvider from "./contexts/ConfigContext";
import TypeModalContextProvider from "./contexts/TypeModalContext";
import DeviceContextProvider from "./contexts/DeviceContext";
function App() {
  return (
    <AuthContextProvider>
      <DeviceContextProvider>
        <DataContextProvider>
          <ConfigContextProvider>
            <TypeContextProvider>
              <StatusContextProvider>
                <TotalVolumeContextProvider>
                  <SetVolumeContextProvider>
                    <TypeModalContextProvider>
                      <Router>
                        <Switch>
                          <Route exact path="/" component={About} />
                          <Route
                            exact
                            path="/login"
                            render={(props) => (
                              <Auth {...props} authRoute="login" />
                            )}
                          />
                          <Route
                            exact
                            path="/register"
                            render={(props) => (
                              <Auth {...props} authRoute="register" />
                            )}
                          />
                          <ProtectedRoute
                            exact
                            path="/dashboard"
                            component={Dashboard}
                          />
                          <ProtectedRoute
                            exact
                            path="/setting"
                            component={Setting}
                          />
                          <ProtectedRoute
                            exact
                            path="/device"
                            component={Device}
                          />
                          <ProtectedRoute
                            exact
                            path="/statistics"
                            component={Statistics}
                          />
                          <Route
                            exact
                            path="/aboutauthor"
                            component={AboutAuthor}
                          />
                        </Switch>
                      </Router>
                    </TypeModalContextProvider>
                  </SetVolumeContextProvider>
                </TotalVolumeContextProvider>
              </StatusContextProvider>
            </TypeContextProvider>
          </ConfigContextProvider>
        </DataContextProvider>
      </DeviceContextProvider>
    </AuthContextProvider>
  );
}

export default App;
