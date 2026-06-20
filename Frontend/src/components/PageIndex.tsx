import { useEffect, useState } from "react";
import type { GebietResource } from "../Resources";
import { LoadingIndicator } from "./LoadingIndicator";
import { fetchWithErrorHandling } from "../backend/fetchWithErrorHandling";
;
import { Button, Container, Table } from "react-bootstrap";
import { Link } from "react-router";
import { useLoginContext } from "../LoginContext";
import { LinkContainer } from "./LinkContainer";

//https://react-bootstrap.github.io/docs/components/table/



export function PageIndex() {
    const [gebietEntries, setGebiete] = useState<GebietResource[]>();
    const { login } = useLoginContext();

    async function load() {
        const HOST = import.meta.env.VITE_API_SERVER_URL
        const url = `${HOST}/api/gebiet/alle`;
        const response = await fetchWithErrorHandling(url, { method: "GET", credentials: "include" });
        const g = await response.json();
        setGebiete(g);
    }
    useEffect(() => { load(); }, [login]);



    if (!gebietEntries) {
        return <LoadingIndicator />
    } else {
        return (
            <Container>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Name des Gebiets</th>
                            <th>Verwalter</th>
                            <th>Beschreibung</th>
                            <th>Erstellungs Datum</th>
                            <th>Links</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gebietEntries.map((g) => (
                            <tr>
                                <td>{g.name}</td>
                                <td>{g.verwalterName}</td>
                                <td>{g.beschreibung}</td>
                                <td>{g.createdAt}</td>

                                <td style={{ width: '150px' }}>
                                    <Link
                                        to={`/gebiet/${g.id}`}>
                                        Ansehen
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                {login ?
                    <LinkContainer to={`/gebiet/neu`}>
                        <Button variant="success" size="lg">Neues Gebiet</Button>
                    </LinkContainer>
                    : <></>
                }
            </Container>
        );
    }
}




//     div className="page-index">
//         {gebietEntries.map(g => (
//             <>
//                 <br/>
//                 <GebietDescription gebiet={g} />
//                 <Link to={`/gebiet/${g.id}`}> View </Link>
//             </>
//         ))}
//     </div>
// )