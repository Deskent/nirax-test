import Register from "./register.component.jsx";
import AuthService from "../services/auth.service";
import { Container } from "react-bootstrap";

export default function Home() {
    const user = AuthService.getCurrentUser();
    return (
        <>
            {!user ? <Register/> : null}
            <Container>
                <header className="jumbotron">
                    <h1>С чего начать?</h1>
                </header>
                <h2 className="mt-5">1. Начальные настройки</h2>

                <p className="mt-3">В разделе «Мои компании» заполните данные по компании и банковскому счету. Компаний и банковских счетов может быть несколько.</p>

                <h2>2. Работа с документами</h2>

                <p className="mt-3">В разделе «Мои документы» можно создать новый документ или скопировать ранее созданный.</p>
                <p className="mt-3">При создании документа выберите из списка свою компанию или заполните ИНН для автозаполнения. Все данные по организации и банковскому счёту будут заполнены автоматически.</p>
                <p className="mt-3">Для ранее созданного документа можно повторно скачать печатную форму (docx/pdf), отредактировать или скопировать в новый документ.</p>
                <p className="mt-3">Документы можно создавать в неограниченном количестве и хранятся неограниченное время.</p>

                <h2 className="mt-3">3. Работа с шаблонами документов</h2>

                <p className="mt-3">В разделе «Шаблоны» хранятся стандартные (типовые) шаблоны различных печатных форм (Счет, Акт, ТОРГ-12, УПД и др).</p>
                <p className="mt-3">При необходимости можно скачать стандартный шаблон, внести исправления (логотип, текст, оформление) и загрузить обратно в систему.</p>

                <h2 className="mt-3">4. Стоимость</h2>

                <p className="mt-3">Сервис предоставляется бесплатно.</p>
            </Container>
        </>
    );
}