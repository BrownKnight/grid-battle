import { Button, ButtonGroup, FloatingLabel, Modal } from "flowbite-react";
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import useLocalStorageState from "use-local-storage-state";
import useApiClient from "./useApiClient";
import { useMatch, useNavigate } from "react-router-dom";
import { RxCaretLeft } from "react-icons/rx";

export type User = { id: string; username: string; idToken: string; refreshToken: string };
export type Props = {
  isLoggedIn: boolean;
  user: User | undefined;
  showLogin: () => void;
  logout: () => void;
  refreshToken: () => Promise<string>;
};

export const UserContext = createContext<Props>({
  isLoggedIn: false,
  user: undefined,
  showLogin: () => {},
  logout: () => {},
  refreshToken: async () => "",
});

export default function UserContextProvider({ children }: React.PropsWithChildren) {
  const navigate = useNavigate();
  const isWellKnownChangePassword = useMatch("/.well-known/change-password");
  const [user, setUser] = useLocalStorageState<User | undefined>("user", { defaultValue: undefined });
  // Show modal by default if we're on the ChangePassword URL
  const [isLoginOpen, setIsLoginOpen] = useState(!!isWellKnownChangePassword);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!user?.idToken);
  }, [user]);

  useEffect(() => {
    if (isWellKnownChangePassword) {
      setUser(undefined);
    }
  }, [isWellKnownChangePassword, setUser]);

  const showLogin = () => {
    setIsLoginOpen(true);
  };

  const logout = () => setUser(undefined);

  const refreshToken = async () => {
    if (!user) return "";

    const request = {
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: "6q9id5vhqfocb9mc0deep4at49",
      AuthParameters: {
        REFRESH_TOKEN: user.refreshToken,
      },
    };

    const res = await fetch("https://cognito-idp.eu-west-2.amazonaws.com/", {
      method: "POST",
      headers: [
        ["Content-Type", "application/x-amz-json-1.1"],
        ["X-Amz-Target", "AWSCognitoIdentityProviderService.InitiateAuth"],
      ],
      body: JSON.stringify(request),
    });

    const json = await res.json();
    if (json?.AuthenticationResult) {
      setUser({
        username: user.username,
        id: user.id,
        refreshToken: user.refreshToken,
        idToken: json?.AuthenticationResult?.IdToken,
      });
    } else {
      console.error("Tried to refresh token but got no new token");
    }

    return json?.AuthenticationResult?.IdToken as string;
  };

  const onClose = () => {
    setIsLoginOpen(false);
    if (isWellKnownChangePassword) {
      navigate("/");
    } else {
      navigate("#");
    }
  };

  return (
    <UserContext.Provider value={{ user: user, isLoggedIn: isLoggedIn, showLogin: showLogin, logout: logout, refreshToken }}>
      {children}

      {isLoggedIn ? (
        <UserModal show={isLoginOpen} onClose={onClose} />
      ) : (
        <LoginModal show={isLoginOpen} onClose={onClose} setUser={setUser} />
      )}
    </UserContext.Provider>
  );
}

function UserModal({ show, onClose }: { show: boolean; onClose: () => void }) {
  const { user, logout } = useContext(UserContext);

  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>My Account</Modal.Header>
      <Modal.Body>
        <div>Welcome, {user?.username}</div>
        <Button color="red" onClick={logout}>
          Logout
        </Button>
      </Modal.Body>
    </Modal>
  );
}

function LoginModal({
  show,
  onClose,
  setUser,
}: {
  show: boolean;
  onClose: () => void;
  setUser: Dispatch<SetStateAction<User | undefined>>;
}) {
  const isWellKnownChangePassword = useMatch("/.well-known/change-password");
  const navigate = useNavigate();
  const apiClient = useApiClient();

  type Page = "login" | "register" | "validateEmail" | "forgotPassword" | "forgotPasswordConfirm";
  const [page, setPage] = useState<Page>(isWellKnownChangePassword ? "forgotPassword" : "login");

  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const request = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: "6q9id5vhqfocb9mc0deep4at49",
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    };

    fetch("https://cognito-idp.eu-west-2.amazonaws.com/", {
      method: "POST",
      headers: [
        ["Content-Type", "application/x-amz-json-1.1"],
        ["X-Amz-Target", "AWSCognitoIdentityProviderService.InitiateAuth"],
      ],
      body: JSON.stringify(request),
    })
      .then((res) => {
        if (res.status >= 400) {
          res.json().then((err) => {
            if (err.__type === "UserNotConfirmedException") {
              setPage("validateEmail");
              return;
            }
            setErrorMessage(err.message ?? "Failed to login.");
            return;
          });
          return;
        }
        return res.json();
      })
      .then((res) => {
        if (!res) return;
        if (res.AuthenticationResult) {
          const idToken = res.AuthenticationResult.IdToken;
          const refreshToken = res.AuthenticationResult.RefreshToken;

          // Check the user is registered and retrieve the user info
          apiClient.getCurrentProfile(idToken).then(({ json }) => {
            setUser({ id: json.userId, username: json.username, idToken: idToken, refreshToken: refreshToken });
            onClose();
            if (isWellKnownChangePassword) {
              navigate("/");
            }
          });
        } else {
          setErrorMessage("Failed to login.");
          console.error("unexpected response:", res);
        }
      });
  };

  const register = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const request = {
      ClientId: "6q9id5vhqfocb9mc0deep4at49",
      Username: username,
      Password: password,
      UserAttributes: [{ Name: "email", Value: email }],
    };
    fetch("https://cognito-idp.eu-west-2.amazonaws.com/", {
      method: "POST",
      headers: [
        ["Content-Type", "application/x-amz-json-1.1"],
        ["X-Amz-Target", "AWSCognitoIdentityProviderService.SignUp"],
      ],
      body: JSON.stringify(request),
    }).then((res) => {
      if (res.status >= 400) {
        res.json().then((err) => setErrorMessage(err.message ?? "Failed to login."));
        return;
      }
      return login(e);
    });
  };

  const confirmAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const request = {
      ClientId: "6q9id5vhqfocb9mc0deep4at49",
      Username: username,
      ConfirmationCode: verificationCode,
    };
    fetch("https://cognito-idp.eu-west-2.amazonaws.com/", {
      method: "POST",
      headers: [
        ["Content-Type", "application/x-amz-json-1.1"],
        ["X-Amz-Target", "AWSCognitoIdentityProviderService.ConfirmSignUp"],
      ],
      body: JSON.stringify(request),
    }).then((res) => {
      if (res.status >= 400) {
        res.json().then((err) => {
          if (err.__type === "ExpiredCodeException") {
            setPage("login");
            setErrorMessage("Your code has expired, please try to log in again");
            return;
          }

          setErrorMessage(err.message ?? "Failed to login.");
        });
        return;
      }
      setVerificationCode("");
      return login(e);
    });
  };

  const sendForgotPasswordVerificationCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const request = {
      ClientId: "6q9id5vhqfocb9mc0deep4at49",
      Username: username,
    };
    fetch("https://cognito-idp.eu-west-2.amazonaws.com/", {
      method: "POST",
      headers: [
        ["Content-Type", "application/x-amz-json-1.1"],
        ["X-Amz-Target", "AWSCognitoIdentityProviderService.ForgotPassword"],
      ],
      body: JSON.stringify(request),
    }).then((res) => {
      if (res.status >= 400) {
        res.json().then((err) => {
          if (err.__type === "InvalidParameterException") {
            setErrorMessage("The provided username/email does not exist.");
            return;
          }

          setErrorMessage(err.message ?? "Failed to process request.");
        });
        return;
      }
      setPage("forgotPasswordConfirm");
    });
  };

  const confirmChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const request = {
      ClientId: "6q9id5vhqfocb9mc0deep4at49",
      Username: username,
      Password: password,
      ConfirmationCode: verificationCode,
    };
    fetch("https://cognito-idp.eu-west-2.amazonaws.com/", {
      method: "POST",
      headers: [
        ["Content-Type", "application/x-amz-json-1.1"],
        ["X-Amz-Target", "AWSCognitoIdentityProviderService.ConfirmForgotPassword"],
      ],
      body: JSON.stringify(request),
    }).then((res) => {
      if (res.status >= 400) {
        res.json().then((err) => {
          if (err.__type === "ExpiredCodeException") {
            setPage("forgotPassword");
            setErrorMessage("The code provided has expired, please request a new code by providing your username again.");
            return;
          }

          setErrorMessage(err.message ?? "Failed to reset password due to unknown error.");
        });
        return;
      }
      setPage("login");
      setVerificationCode("");
      navigate("#");
    });
  };

  const returnToLogin = (
    <a href="#" className="flex items-center mb-4 text-sm text-sky-400 hover:text-sky-600" onClick={() => setPage("login")}>
      <RxCaretLeft /> <span>Return to Login</span>
    </a>
  );

  const loginForm = (
    <>
      <ButtonGroup>
        <Button fullSized onClick={() => setPage("login")} color={page === "login" ? "dark" : "gray"}>
          Login
        </Button>
        <Button fullSized onClick={() => setPage("register")} color={page === "register" ? "dark" : "gray"}>
          Register
        </Button>
      </ButtonGroup>

      <form action="#" method="POST" onSubmit={(e) => (page === "login" ? login(e) : register(e))} autoComplete="on">
        <FloatingLabel
          id="username"
          name="username"
          className="dark:bg-slate-900"
          variant="outlined"
          label="Username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={64}
          required
        />
        {page === "register" && (
          <FloatingLabel
            id="email"
            name="email"
            className="dark:bg-slate-900"
            variant="outlined"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={200}
            required
          />
        )}
        <FloatingLabel
          id={page === "login" ? "current-password" : "new-password"}
          name={page === "login" ? "current-password" : "new-password"}
          className="dark:bg-slate-900"
          variant="outlined"
          label="Password"
          type="password"
          autoComplete={page === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="text-xs text-sky-400 hover:text-sky-600">
          <a href="#" onClick={() => setPage("forgotPassword")}>
            Forgot your Password?
          </a>
        </div>
        <Button className="mt-3" type="submit" fullSized>
          {page === "login" ? "Login" : "Register"}
        </Button>
      </form>
    </>
  );

  const validateEmailForm = (
    <form onSubmit={confirmAccount}>
      {returnToLogin}
      <span className="dark:text-gray-100">A verification code has been sent to your email. Please enter it to confirm your account.</span>
      <FloatingLabel
        id="verification-code"
        name="verification-code"
        className="dark:bg-slate-900"
        variant="outlined"
        label="Verification Code"
        autoCorrect="false"
        type="text"
        autoComplete="one-time-code"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        required
      />
      <Button type="submit" fullSized>
        Confirm
      </Button>
    </form>
  );

  const forgotPasswordForm = (
    <form onSubmit={sendForgotPasswordVerificationCode}>
      {returnToLogin}
      <div className="mb-2 dark:text-gray-100">
        Please enter the username/email of the account you would like to reset the password for:
      </div>
      <FloatingLabel
        id="username"
        name="username"
        className="dark:bg-slate-900"
        variant="outlined"
        label="Username"
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        maxLength={64}
        required
      />
      <Button type="submit" fullSized>
        Submit
      </Button>
    </form>
  );

  const changePasswordForm = (
    <form action="#" method="POST" onSubmit={confirmChangePassword} autoComplete="on">
      {returnToLogin}
      <span className="dark:text-gray-100">A verification code has been sent to your email. Please enter it and your new password.</span>
      <FloatingLabel
        id="verification-code"
        name="verification-code"
        className="dark:bg-slate-900"
        variant="outlined"
        label="Verification Code"
        autoCorrect="false"
        type="text"
        autoComplete="one-time-code"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        required
      />
      <FloatingLabel
        id="username"
        name="username"
        className="dark:bg-slate-900"
        variant="outlined"
        label="Username"
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        maxLength={64}
        required
      />
      <FloatingLabel
        id="password"
        name="password"
        className="dark:bg-slate-900"
        variant="outlined"
        label="Password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" fullSized>
        Change Password
      </Button>
    </form>
  );

  const content = () => {
    switch (page) {
      case "login":
      case "register":
        return loginForm;
      case "validateEmail":
        return validateEmailForm;
      case "forgotPassword":
        return forgotPasswordForm;
      case "forgotPasswordConfirm":
        return changePasswordForm;
    }
  };

  return (
    <Modal show={show} onClose={onClose} dismissible>
      <Modal.Header>My Account</Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-4">
          {content()}
          <span className="text-red-500">{errorMessage}</span>
        </div>
      </Modal.Body>
    </Modal>
  );
}
