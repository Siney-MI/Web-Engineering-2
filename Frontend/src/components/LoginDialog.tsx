import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useLoginContext } from "../LoginContext";
import { postLogin } from "../backend/api";

interface LoginDialogProps {
    show: boolean;
    onHide: () => void;
}

export function LoginDialog({ show, onHide }: LoginDialogProps) {


    const { setLogin} = useLoginContext();
    const [loginData, setLoginData] = useState({ campusID: "", passwort: "" });
    const [failedLogin, setFailedLogin] = useState(false);


    function update(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    }

    const onLogin = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        try{
        const currentLoginInfo = await postLogin(loginData.campusID, loginData.passwort);
            setLogin(currentLoginInfo)
            onHide()
        } catch(error) {
            setFailedLogin(true);
        }

    }

    function onCancel() {
        setFailedLogin(false)
        onHide();
    }


    return (
        <Modal show={show} onHide={onHide}>
            <Form>
                <Modal.Header closeButton>
                    <Modal.Title>Login</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form.Group className="mb-3" controlId="formCampusID">
                        <Form.Label>Campus ID</Form.Label>
                        <Form.Control
                            type="text"
                            name="campusID"
                            placeholder="Campus ID eingeben"
                            onChange={update}
                            value={loginData.campusID}

                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formPasswort">
                        <Form.Label>Passwort</Form.Label>
                        <Form.Control
                            type="password"
                            name="passwort"
                            placeholder="Passwort eingeben"
                            onChange={update}
                            value={loginData.passwort}
                        />
                    </Form.Group>
                    {failedLogin ? 
                        <div className="alert alert-danger" role="alert">
                            Login fehlgeschlagen. Bitte prüfen Sie Ihre Daten. 
                        </div>
                    : <></>}

                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={onCancel}>
                        Abbrechen
                    </Button>
                    <Button onClick={onLogin}>
                        OK
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}