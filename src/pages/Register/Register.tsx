import { useState, useEffect } from 'preact/hooks';
import './register.scss';
import { h } from 'preact';
import { useAuth } from '../../context/AuthContext';

const Register = ({
    path,
    isRegistered,
}: {
    path?: string;
    isRegistered?: boolean;
}) => {
    return (
        <>
            <img class="app_bg_img " src="/public/torus.png" alt="" />
            <div className="register_container">
                <div class="register_canvas ">
                    <div class="section left">
                        <h1 class="weight_700 text_white">AlooChat</h1>
                        <div>
                            {/* <img src="public/register_left.png" alt="" /> */}
                            <img
                                src="https://qph.cf2.quoracdn.net/main-qimg-1fddafb346f50427ecf3597b27e10c9a"
                                alt=""
                            />
                            {/* <img
                            src="https://qph.cf2.quoracdn.net/main-qimg-821d805a13857a03a475aac7d7069f76"
                            alt=""
                        /> */}
                        </div>
                        <p class="">
                            Discover the beauty of words in a world waiting to
                            be heard.
                        </p>
                    </div>
                    <div class="section right">
                        {isRegistered ? <LoginForm /> : <RegisterForm />}
                    </div>
                </div>
            </div>
        </>
    );
};

const LoginForm = () => {
    const [data, setdata] = useState({
        username: '',
        password: '',
    });

    const { login } = useAuth();
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const prefill_username = urlParams.get('username');
        const prefill_password = urlParams.get('password');
        if (prefill_username && prefill_password) {
            setdata({
                username: prefill_username,
                password: prefill_password,
            });
        }
    }, []);
    function handleLogin(e: h.JSX.TargetedEvent<HTMLFormElement>) {
        e.preventDefault();
        login(data);
    }
    const handleDataChange =
        (name: string) => (e: h.JSX.TargetedEvent<HTMLInputElement>) => {
            setdata({
                ...data,
                [name]: e.currentTarget.value,
            });
        };
    return (
        <>
            <div class="layout_container">
                <h5 class="text-center mb-5">Login</h5>
                <form onSubmit={(e) => handleLogin(e)}>
                    <input
                        type="text"
                        class="form-control my-3"
                        placeholder="Username"
                        value={data.username}
                        onInput={handleDataChange('username')}
                        autofocus
                    ></input>
                    <input
                        type="password"
                        class="form-control my-3"
                        id="exampleFormControlInput1"
                        placeholder="Password"
                        value={data.password}
                        onInput={handleDataChange('password')}
                    ></input>
                    <button
                        className="btn btn_primary rounded-pill w-100"
                        disabled={Object.values(data).some((val) => !val)}
                    >
                        Login
                    </button>
                </form>

                <div class="text-divider">
                    <span>or</span>
                </div>
                <p class="text-center q">Have no account yet?</p>
                <button className="btn btn_primary_hollow rounded-pill w-100">
                    Register
                </button>
            </div>
        </>
    );
};

const RegisterForm = () => {
    const { register } = useAuth();

    const [data, setdata] = useState({
        username: 'ryal_rafterr',
        email: 'raftere@gmail.com',
        password: '123456',
        confirmPassword: '123456',
    });
    const handleDataChange =
        (name: string) => (e: h.JSX.TargetedEvent<HTMLInputElement>) => {
            setdata({
                ...data,
                [name]: e.currentTarget.value,
            });
        };
    useEffect(() => {
        console.log(data);
    }, [data]);

    function handleRegister(e: h.JSX.TargetedEvent<HTMLFormElement>) {
        e.preventDefault();
        const { username, email, password } = data;
        const simplifiedData = { username, email, password };
        register(simplifiedData);
    }

    return (
        <>
            <div class="layout_container">
                <h5 class="text-center mb-4">Register</h5>
                <form onSubmit={(e) => handleRegister(e)}>
                    <input
                        type="text"
                        class="form-control my-3"
                        placeholder="Username"
                        value={data.username}
                        onInput={handleDataChange('username')}
                    ></input>
                    <input
                        type="email"
                        class="form-control my-3"
                        placeholder="Email"
                        value={data.email}
                        onInput={handleDataChange('email')}
                    ></input>
                    <input
                        type="password"
                        class="form-control my-3"
                        id="exampleFormControlInput1"
                        placeholder="Password"
                        value={data.password}
                        onInput={handleDataChange('password')}
                    ></input>
                    <input
                        type="password"
                        class="form-control my-3"
                        id="exampleFormControlInput1"
                        placeholder="Confirm Password"
                        value={data.confirmPassword}
                        onInput={handleDataChange('confirmPassword')}
                    ></input>
                    <button
                        disabled={Object.values(data).some((val) => !val)}
                        className="btn btn_primary rounded-pill w-100"
                    >
                        Register
                    </button>
                </form>

                <div class="text-divider">
                    <span>or</span>
                </div>
                <p class="text-center q">Already have an account?</p>
                <button className="btn btn_primary_hollow rounded-pill w-100">
                    Login
                </button>
            </div>
        </>
    );
};
export default Register;
