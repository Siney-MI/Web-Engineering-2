import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { LinkContainer } from './LinkContainer';
import { Button } from 'react-bootstrap';
import { useState } from 'react';
import { deleteLogin } from '../backend/api';
import { LoginDialog } from './LoginDialog';
import { useLoginContext } from '../LoginContext';
import { useNavigate } from 'react-router';


//https://react-bootstrap.github.io/docs/components/navbar

export function Header() {

    const { login, setLogin } = useLoginContext();
    const [show, setOpen] = useState(false);

    const isAdmin = login && login.role === 'a';
    const navigate = useNavigate();

    function onHide() {
        setOpen(false);
    }


    return (
        <>
            <Navbar expand="lg" className="navbar-dark bg-dark shadow-sm">
                <Container>
                    <LinkContainer to="/">
                        <Navbar.Brand>App</Navbar.Brand>
                    </LinkContainer>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <LinkContainer to={'/'}>
                                <Nav.Link>Übersicht</Nav.Link>
                            </LinkContainer>
                            {isAdmin ? 
                                <LinkContainer to={'/admin'}>
                                    <Nav.Link>Admin</Nav.Link>
                                </LinkContainer>
                                :<></>
                            }
                            {login ? 
                                <LinkContainer to={'/prefs'}>
                                    <Nav.Link>Prefs</Nav.Link>
                                </LinkContainer>
                                :<></>
                            }
                        </Nav>
                        <Nav>
                            {login ? (
                                <Button variant="outline-light" onClick={async () => {
                                    await deleteLogin();
                                    setLogin(false);
                                    navigate(`/`);
                                }}>Logout</Button>
                            ) : (
                                <Button variant="outline-light" onClick={() => setOpen(true)}>Login</Button>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar >
            <LoginDialog show={show} onHide={onHide} />
        </>
    );
}

export default Header;
