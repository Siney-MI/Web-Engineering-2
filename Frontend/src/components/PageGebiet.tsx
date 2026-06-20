import { useState, useEffect } from "react";
import type { GebietResource, ThemaResource } from "../Resources";
import { LoadingIndicator } from "./LoadingIndicator";
import { Link, useNavigate, useParams } from "react-router";
import { createGebiet, deleteGebiet, getAlleThemen, getGebiet, updateGebiet } from "../backend/api";
import { useErrorBoundary } from "react-error-boundary";
import { Card, Container, ListGroup, Table, Form, Button, Alert, Modal } from "react-bootstrap";
import { useLoginContext } from "../LoginContext";
import { LinkContainer } from "./LinkContainer";
import { ErrorFromValidation } from "../backend/fetchWithErrorHandling";

//https://react-bootstrap.github.io/docs/components/cards/
//https://react-bootstrap.github.io/docs/components/table/


export function PageGebiet() {

    const params = useParams();
    const id = params.id;
    //console.log("ID: " + id)
    const { showBoundary } = useErrorBoundary();
    const { login } = useLoginContext();
    const navigate = useNavigate();
    const [validationError, setValidationError] = useState<string | null>(null);
    const [deleteButton, setDeleteButton] = useState(false);

    const [editieren, setEditieren] = useState(false);

    const [gebiet, setGebiet] = useState<GebietResource>({
        id: '',
        name: '',
        beschreibung: '',
        verwalter: '',
        verwalterName: '',
        createdAt: '',
        public: false,
        closed: false
    });

    const [themenEntries, setThema] = useState<ThemaResource[]>();

    async function load() {
        if (id && id !== "neu") {
            try {
                const g = await getGebiet(id);
                setGebiet(g);
            } catch (error) {
                showBoundary(error);
            }
        }
    }


    async function loadThema() {

        if (id && id !== "neu") {
            try {
                const t = await getAlleThemen(id);
                setThema(t);
            } catch (error) {
                showBoundary(error);
            }
        }
    }


    function update(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const value = "checked" in e.target ? e.target.checked : e.target.value;
        setGebiet({ ...gebiet, [e.target.name]: value });
    }


    function updates(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setGebiet({ ...gebiet, [e.target.name]: e.target.value });
    }


    async function deleteGebietEintrag() {
        if (id && id !== "neu") {
            try {
                await deleteGebiet(id);
                setDeleteButton(false);
                navigate("/");
            } catch (error) {
                setDeleteButton(false);
                showBoundary(error);
            }
        }
    }


    async function save(e: React.SyntheticEvent) {
        //console.log("Hier auch auch: ")
        e.preventDefault();
        setValidationError(null);

        if (gebiet.name.length < 3) {
            setValidationError("Der Name muss mindestens 3 Zeichen lang sein.");
            return;
        }
        if ((gebiet.beschreibung || "").length > 1000) {
            setValidationError("Die Beschreibung darf maximal 1000 Zeichen lang sein.");
            return;
        }

        //console.log("Hier auch: ")

        try {
            if (id === "neu") {
                const neuesGebiet = await createGebiet(gebiet);
                navigate(`/gebiet/${neuesGebiet.id}`);
            } else {
                const updatedGebiet = await updateGebiet(gebiet);
                setGebiet(updatedGebiet);
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
        if (id === "neu") {
            setEditieren(true);
            if (login) {
                setGebiet(g => ({
                    id: g.id,
                    name: g.name,
                    beschreibung: g.beschreibung,
                    createdAt: g.createdAt,
                    public: g.public,
                    closed: g.closed,
                    verwalter: login.id,
                    verwalterName: ''
                }));
            }
        } else {
            setEditieren(false);
            loadThema();
            load();
        }
    }, [id, login]);

    if (id === "neu" || editieren) {
        return (
            <Container className="mt-4" style={{ maxWidth: '800px' }}>
                <Card className="p-4 shadow-sm">

                    <h3 className="mb-4">{id === "neu" ? "Neues Gebiet anlegen" : "Gebiet bearbeiten"}</h3>
                    {validationError && (
                        <Alert variant="danger">{validationError}</Alert>
                    )}
                    <Form className="text-start">
                        <Form.Group className="mb-3" controlId="formName">
                            <Form.Label className="fw-bold">Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                placeholder="Name des Gebiets eingeben"
                                onChange={updates}
                                value={gebiet.name}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBeschreibung">
                            <Form.Label className="fw-bold">Beschreibung</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="beschreibung"
                                placeholder="Beschreiben Sie das Gebiet..."
                                onChange={updates}
                                value={gebiet.beschreibung}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="formPublic">
                            <Form.Check
                                type="checkbox"
                                label="öffentlich"
                                name="public"
                                checked={gebiet.public}
                                onChange={update}
                                className="fw-bold"
                            />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="formPublic">
                            <Form.Check
                                type="checkbox"
                                label="geschlossen"
                                name="closed"
                                checked={gebiet.closed}
                                onChange={update}
                                className="fw-bold"
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
                                    if (id === "neu") {
                                        navigate("/");
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

    }
    else if (!gebiet || !themenEntries) {
        return <LoadingIndicator />
    } else {
        const isVerwalter = login && gebiet.verwalter && (login.id === gebiet.verwalter);
        return (
            <>
                <Card style={{ width: '76rem' }}>
                    <ListGroup variant="flush">
                        <ListGroup.Item>Gebiet: {gebiet.name}</ListGroup.Item>
                        <ListGroup.Item>Beschreibung: {gebiet.beschreibung} </ListGroup.Item>
                        <ListGroup.Item>Verwalter: {gebiet.verwalterName}</ListGroup.Item>
                        <ListGroup.Item>Erstellt am: {gebiet.createdAt}</ListGroup.Item>
                    </ListGroup>
                </Card>


                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Titel des Themas</th>
                            <th>Status</th>
                            <th>Abschluss</th>
                            <th>Betreuer</th>
                            <th>Links</th>
                        </tr>
                    </thead>
                    <tbody>
                        {themenEntries.map((thema) => (
                            <tr>
                                <td>{thema.titel}</td>
                                <td>{thema.status}</td>
                                <td>{thema.abschluss}</td>
                                <td>{thema.betreuerName}</td>

                                <td style={{ width: '150px' }}>
                                    <Link
                                        to={`/thema/${thema.id}`}
                                    >
                                        Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {isVerwalter && (
                    <div className="d-flex gap-2">
                        <Button variant="success" type="button" onClick={() => setEditieren(true)}>

                            Editieren
                        </Button>
                        <LinkContainer to={`/gebiet/${gebiet.id}/thema/neu`}>
                            <Button variant="primary">Neues Thema</Button>
                        </LinkContainer>
                      
                            <Button
                                variant="danger"
                                onClick={() => setDeleteButton(true)}
                                disabled={themenEntries && themenEntries.length > 0}
                            >
                                Löschen
                            </Button>
            

                    </div>
                )}

                <Link
                    to={`/`}
                >
                    Zurück zur Gebietsübersicht
                </Link>

                <Modal show={deleteButton} onHide={() => setDeleteButton(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Gebiet löschen</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Möchtst du das Gebiet "{gebiet.name}" wirklich löschen?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setDeleteButton(false)}>
                            Abbrechen
                        </Button>
                        <Button variant="danger" onClick={deleteGebietEintrag}>
                            OK
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        )




        // <div>
        //     <table border={2} align="left" width="500">
        //         <thead><tr><th>Gebiet: {gebiet.name}</th></tr></thead>
        //         <tbody>
        //             <tr><td>Verwaltername: {gebiet.verwalterName}</td></tr>
        //             <tr><td>Beschreibung: {gebiet.beschreibung}</td></tr>
        //             <tr><td>Erstellungs Datum: {gebiet.createdAt}</td></tr>
        //         </tbody>
        //     </table>

        //     <br style={{ clear: "both" }} />
        //     {themenEntries.map(thema => (
        //         <>
        //             <Thema thema={thema} />
        //             <Link to={`/thema/${thema.id}`}> Thema Details</Link>
        //         </>
        //     ))}
        // </div>

    }
}
