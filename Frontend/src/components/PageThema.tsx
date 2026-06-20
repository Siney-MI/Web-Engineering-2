import { useNavigate, useParams } from "react-router";
import { createThema, deleteThema, getThema, updateThema } from "../backend/api";
import { useEffect, useState } from "react";
import { ThemaResource } from "../Resources";
import { LoadingIndicator } from "./LoadingIndicator";
import { useErrorBoundary } from "react-error-boundary";
import { Alert, Button, Card, Container, Form, Modal, Table } from "react-bootstrap";
import { Link } from "react-router";
import { useLoginContext } from "../LoginContext";
import { ErrorFromValidation } from "../backend/fetchWithErrorHandling";

//https://react-bootstrap.github.io/docs/components/table/


export function PageThema() {
    const params = useParams();
    const themaId = params.id;
    const gebietId = params.gebietId;


    const { showBoundary } = useErrorBoundary();
    const { login } = useLoginContext();

    const navigate = useNavigate();

    const [deleteButton, setDeleteButton] = useState(false);
    const [editieren, setEditieren] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);


    const [thema, setThema] = useState<ThemaResource>({
        id: '',
        titel: '',
        beschreibung: '',
        abschluss: 'bsc',
        status: 'offen',
        betreuer: '',
        betreuerName: '',
        updatedAt: '',
        gebiet: '',
        literatur: ''
    });

    async function load() {
        if (gebietId) {
            setEditieren(true);
            if (login) {
                setThema(t => ({
                    ...t,
                    gebiet: gebietId,
                    betreuer: login.id,
                    betreuerName: ''
                }));
            }
        } else if (themaId) {
            try {
                const t = await getThema(themaId);
                setThema(t);
                setEditieren(false);
            } catch (error) {
                showBoundary(error);
            }
        }
    }

    function update(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setThema({ ...thema, [e.target.name]: e.target.value });
    }

    async function deleteThemaEintrag() {
        if (thema.id) {
            try {
                const gebietID = thema.gebiet;
                await deleteThema(thema.id);
                setDeleteButton(false);
                navigate(`/gebiet/${gebietID}`);
            } catch (error) {
                setDeleteButton(false);
                showBoundary(error);
            }
        }
    }

    async function save(e: React.SyntheticEvent) {
        e.preventDefault();
        setValidationError(null);

        if (thema.titel.length < 3) {
            setValidationError("Der Titel muss mindestens 3 Zeichen lang sein.");
            return;
        }

        if (thema.titel.length > 100) {
            setValidationError("Der Titel darf maximal 100 Zeichen lang sein.");
            return;
        }
        if (thema.beschreibung.length < 3) {
            setValidationError("Die Beschreibung muss mindestens 3 Zeichen lang sein.");
            return;
        }

        if (thema.beschreibung.length > 1000) {
            setValidationError("Die Beschreibung darf maximal 1000 Zeichen lang sein.");
            return;
        }

        if (thema.literatur && thema.literatur.length > 0 && thema.literatur.length < 3) {
            setValidationError("Die Literaturangabe muss mindestens 3 Zeichen lang sein.");
            return;
        }

        try {
            if (gebietId) {
                const { id, ...themaOhneId } = thema;
                const neuesThema = await createThema(themaOhneId as ThemaResource);
                navigate(`/thema/${neuesThema.id}`);
            } else {
                const updatedThema = await updateThema(thema);
                setThema(updatedThema);
                setEditieren(false);
            }
        } catch (err) {
            if (err instanceof ErrorFromValidation) {
                err.validationErrors.forEach((validationError) => {
                    setValidationError(validationError.msg);
                });
            } else {
                showBoundary(err);
            }
        }
    }


    useEffect(() => {
        load();
    }, [themaId, gebietId, login]);

    if (editieren) {
        return (
            <Container className="mt-4" style={{ maxWidth: '800px' }}>
                <Card className="p-4 shadow-sm">

                    <h3 className="mb-4">{gebietId ? "Neues Thema anlegen" : "Thema bearbeiten"}</h3>
                    {validationError && (
                        <Alert variant="danger">{validationError}</Alert>
                    )}
                    <Form className="text-start">

                        <Form.Group className="mb-3" controlId="formTitel">
                            <Form.Label className="fw-bold">Titel</Form.Label>
                            <Form.Control
                                type="text"
                                name="titel"
                                placeholder="Titel des Themas"
                                onChange={update}
                                value={thema.titel}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formAbschluss">
                            <Form.Label className="fw-bold">Abschluss</Form.Label>
                            <Form.Select name="abschluss" value={thema.abschluss} onChange={update}>
                                <option value="bsc">B.Sc.</option>
                                <option value="msc">M.Sc.</option>
                                <option value="any">Beliebig</option>
                            </Form.Select>
                        </Form.Group>

                      
                        <Form.Group className="mb-3" controlId="formStatus">
                            <Form.Label className="fw-bold">Status</Form.Label>
                            <Form.Select name="status" value={thema.status} onChange={update}>
                                <option value="offen">offen</option>
                                <option value="reserviert">vergeben</option>
                                <option value="abgegeben">abgeschlossen</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBeschreibung">
                            <Form.Label className="fw-bold">Beschreibung</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="beschreibung"
                                placeholder="Beschreibung..."
                                onChange={update}
                                value={thema.beschreibung}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="formLiteratur">
                            <Form.Label className="fw-bold">Literatur</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="literatur"
                                placeholder="Literaturangaben..."
                                onChange={update}
                                value={thema.literatur || ""}
                            />
                        </Form.Group>

                        <div className="d-flex gap-2">
                            <Button onClick={save} variant="dark" type="submit">
                                Speichern
                            </Button>
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={() => {
                                    if (gebietId) {
                                        navigate(`/gebiet/${gebietId}`);
                                    } else {
                                        setEditieren(false);
                                        setValidationError(null);
                                        load();
                                    }
                                }}
                            >
                                Abbrechen
                            </Button>
                        </div>

                    </Form>
                </Card>
            </Container>
        );

    } else if (!thema.id && !gebietId) {
        return <LoadingIndicator />
    } else {
        const isBetreuer = login && (login.id === thema.betreuer);

        return (
            <Container className="mt-4">
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Titel</th>
                            <th>Beschreibung</th>
                            <th>Abschluss</th>
                            <th>Status</th>
                            <th>Literatur</th>
                            <th>Betreuer</th>
                            <th>Update Datum</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{thema.titel}</td>
                            <td>{thema.beschreibung}</td>
                            <td>{thema.abschluss}</td>
                            <td>{thema.status}</td>
                            <td>{thema.literatur || ""}</td>
                            <td>{thema.betreuerName}</td>
                            <td>{thema.updatedAt}</td>

                        </tr>
                    </tbody>
                </Table>

                <div className="d-flex gap-2 mb-3">
                    {isBetreuer && (
                        <>
                            <Button variant="success" type="button" onClick={() => setEditieren(true)}>
                                Editieren
                            </Button>

                            <Button
                                variant="danger"
                                onClick={() => setDeleteButton(true)}
                            >
                                Löschen
                            </Button>
                        </>
                    )}

                    <Link to={`/gebiet/${thema.gebiet}`} className="btn btn-outline-primary">
                        Zurück zum Gebiet
                    </Link>
                </div>


                <Modal show={deleteButton} onHide={() => setDeleteButton(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Thema löschen</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Möchtest du das Thema "{thema.titel}" wirklich löschen?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setDeleteButton(false)}>
                            Abbrechen
                        </Button>
                        <Button variant="danger" onClick={deleteThemaEintrag}>
                            OK
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        )

        // <table border={2} width="500">
        //     <thead><tr><th>Thema: {thema.titel}</th></tr></thead>
        //     <tbody>
        //         <tr><td>{thema.beschreibung}</td></tr>
        //         <tr><td>Abschluss: {thema.abschluss}</td></tr>
        //         <tr><td>Status: {thema.status}</td></tr>
        //         {/* <tr><td>{thema.betreuer}</td></tr> */}
        //         <tr><td>{thema.betreuerName}</td></tr>
        //         {/* <tr><td>{thema.gebiet}</td></tr> */}
        //         <tr><td>Letztes Update: {thema.updatedAt}</td></tr>
        //     </tbody>
        // </table>
        // )
    }

}