import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function ModalForm(props) {

    const yes = () => {
        props.deleteFunc(props.deletedId);
        props.onHide();
    }

    return (
        <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Удаление
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h4>Вы действительно хотите {props.title}?</h4>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={yes}>Да</Button>
                <Button variant="secondary" onClick={props.onHide}>Нет</Button>
            </Modal.Footer>
        </Modal>
    );
}
export default ModalForm;