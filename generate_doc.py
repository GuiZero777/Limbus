import zipfile
import os

def create_simplified_docx(filename):
    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>"""

    package_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

    doc_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>"""

    styles_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:docDefaults>
        <w:rPrDefault>
            <w:rPr>
                <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
                <w:sz w:val="22"/>
                <w:color w:val="222222"/>
            </w:rPr>
        </w:rPrDefault>
        <w:pPrDefault>
            <w:pPr>
                <w:spacing w:line="276" w:lineRule="auto" w:after="120"/>
            </w:pPr>
        </w:pPrDefault>
    </w:docDefaults>
</w:styles>"""

    def escape(s):
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;").replace("'", "&apos;")

    def p(text="", bold=False, italic=False, size=22, color="222222", align="left", space_after=120, space_before=0):
        align_xml = f'<w:jc w:val="{align}"/>' if align != "left" else ""
        b_xml = "<w:b/>" if bold else ""
        i_xml = "<w:i/>" if italic else ""
        return f"""
        <w:p>
            <w:pPr>
                {align_xml}
                <w:spacing w:before="{space_before}" w:after="{space_after}" w:line="276" w:lineRule="auto"/>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                    {b_xml}
                    {i_xml}
                    <w:color w:val="{color}"/>
                    <w:sz w:val="{size}"/>
                </w:rPr>
                <w:t xml:space="preserve">{escape(text)}</w:t>
            </w:r>
        </w:p>"""

    def p_runs(runs, align="left", space_after=120, space_before=0):
        align_xml = f'<w:jc w:val="{align}"/>' if align != "left" else ""
        runs_xml = ""
        for text, bold, italic, size, color in runs:
            b_xml = "<w:b/>" if bold else ""
            i_xml = "<w:i/>" if italic else ""
            runs_xml += f"""
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                    {b_xml}
                    {i_xml}
                    <w:color w:val="{color}"/>
                    <w:sz w:val="{size}"/>
                </w:rPr>
                <w:t xml:space="preserve">{escape(text)}</w:t>
            </w:r>"""
        return f"""
        <w:p>
            <w:pPr>
                {align_xml}
                <w:spacing w:before="{space_before}" w:after="{space_after}" w:line="276" w:lineRule="auto"/>
            </w:pPr>
            {runs_xml}
        </w:p>"""

    def table(rows, col_widths, headers=None, bg_header="2B4C7E"):
        xml = """<w:tbl>
            <w:tblPr>
                <w:tblW w:w="9360" w:type="dxa"/>
                <w:tblBorders>
                    <w:top w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
                    <w:left w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
                    <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
                    <w:right w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
                    <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E0E0E0"/>
                    <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E0E0E0"/>
                </w:tblBorders>
                <w:tblCellMar>
                    <w:top w:w="120" w:type="dxa"/>
                    <w:left w:w="160" w:type="dxa"/>
                    <w:bottom w:w="120" w:type="dxa"/>
                    <w:right w:w="160" w:type="dxa"/>
                </w:tblCellMar>
            </w:tblPr>"""
        
        if headers:
            xml += "<w:tr><w:trPr><w:tblHeader/></w:trPr>"
            for i, h in enumerate(headers):
                w = col_widths[i] if i < len(col_widths) else 2000
                xml += f"""<w:tc>
                    <w:tcPr>
                        <w:tcW w:w="{w}" w:type="dxa"/>
                        <w:shd w:val="clear" w:color="auto" w:fill="{bg_header}"/>
                    </w:tcPr>
                    <w:p>
                        <w:pPr><w:spacing w:before="60" w:after="60"/></w:pPr>
                        <w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">{escape(h)}</w:t></w:r>
                    </w:p>
                </w:tc>"""
            xml += "</w:tr>"

        for r_idx, row in enumerate(rows):
            bg = "F9FAFC" if r_idx % 2 == 1 else "FFFFFF"
            xml += "<w:tr>"
            for i, cell in enumerate(row):
                w = col_widths[i] if i < len(col_widths) else 2000
                xml += f"""<w:tc>
                    <w:tcPr>
                        <w:tcW w:w="{w}" w:type="dxa"/>
                        <w:shd w:val="clear" w:color="auto" w:fill="{bg}"/>
                    </w:tcPr>
                    <w:p>
                        <w:pPr><w:spacing w:before="60" w:after="60"/></w:pPr>
                        <w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">{escape(cell)}</w:t></w:r>
                    </w:p>
                </w:tc>"""
            xml += "</w:tr>"

        xml += "</w:tbl>"
        return xml

    def callout_box(title, text):
        return f"""
        <w:tbl>
            <w:tblPr>
                <w:tblW w:w="9360" w:type="dxa"/>
                <w:tblBorders>
                    <w:top w:val="single" w:sz="6" w:space="0" w:color="2B4C7E"/>
                    <w:left w:val="single" w:sz="24" w:space="0" w:color="2B4C7E"/>
                    <w:bottom w:val="single" w:sz="6" w:space="0" w:color="2B4C7E"/>
                    <w:right w:val="single" w:sz="6" w:space="0" w:color="2B4C7E"/>
                </w:tblBorders>
                <w:tblCellMar>
                    <w:top w:w="160" w:type="dxa"/>
                    <w:left w:w="200" w:type="dxa"/>
                    <w:bottom w:w="160" w:type="dxa"/>
                    <w:right w:w="200" w:type="dxa"/>
                </w:tblCellMar>
            </w:tblPr>
            <w:tr>
                <w:tc>
                    <w:tcPr>
                        <w:tcW w:w="9360" w:type="dxa"/>
                        <w:shd w:val="clear" w:color="auto" w:fill="F0F4F8"/>
                    </w:tcPr>
                    <w:p>
                        <w:pPr><w:spacing w:before="60" w:after="60"/></w:pPr>
                        <w:r><w:rPr><w:b/><w:color w:val="2B4C7E"/><w:sz w:val="21"/></w:rPr><w:t xml:space="preserve">{escape(title)}</w:t></w:r>
                    </w:p>
                    <w:p>
                        <w:pPr><w:spacing w:before="60" w:after="60"/></w:pPr>
                        <w:r><w:rPr><w:sz w:val="20"/><w:color w:val="333333"/></w:rPr><w:t xml:space="preserve">{escape(text)}</w:t></w:r>
                    </w:p>
                </w:tc>
            </w:tr>
        </w:tbl>"""

    body_xml = ""

    # Header
    body_xml += p("ATIVIDADE DE LABORATÓRIO", bold=True, size=28, color="1E3A8A", align="center", space_after=40)
    body_xml += p("LEVANTAMENTO DE REQUISITOS — SISTEMA FILA+", bold=True, size=24, color="2B4C7E", align="center", space_after=60)
    body_xml += p("Duração: 2 horas | Trabalho em grupos de 4 a 5 alunos", italic=True, size=18, color="666666", align="center", space_after=180)

    # Identificação Table
    id_rows = [
        ["Curso: Análise e Desenvolvimento de Sistemas", "Turma: Projeto e Engenharia de Software"],
        ["Professor(a): Armando Cardoso Ribas", "Integrantes: Guilherme Vasconcellos Bardalho"]
    ]
    body_xml += table(id_rows, [4680, 4680])
    body_xml += p("", space_after=140)

    # 1. Objetivo da atividade
    body_xml += p("1. Objetivo da atividade", bold=True, size=22, color="1E3A8A", space_before=120, space_after=60)
    body_xml += p("Atuar como uma equipe de Analistas de Requisitos para investigar um problema, identificar stakeholders, escolher técnicas de levantamento e especificar requisitos funcionais e não funcionais. O grupo deverá também identificar ambiguidades, requisitos implícitos e conflitos entre stakeholders.", size=20, space_after=140)

    # 2. Estudo de caso
    body_xml += p("2. Estudo de caso — Sistema Fila+", bold=True, size=22, color="1E3A8A", space_before=120, space_after=60)
    body_xml += p("A universidade deseja desenvolver um novo sistema chamado Fila+, destinado a melhorar o atendimento aos estudantes. Atualmente, os alunos precisam ir presencialmente até a secretaria, retirar uma senha e permanecer no local aguardando atendimento.", size=20, space_after=60)
    body_xml += callout_box('Declaração da Direção:', '“Precisamos de um sistema moderno para diminuir as filas, melhorar o atendimento e permitir que os alunos acompanhem sua vez pelo celular.”')
    body_xml += p("A direção não especificou exatamente como o sistema deverá funcionar. A equipe de vocês foi contratada para realizar o levantamento de requisitos antes do início do desenvolvimento.", size=20, space_before=60, space_after=140)

    # 3. Missão do grupo
    body_xml += p("3. Missão do grupo", bold=True, size=22, color="1E3A8A", space_before=120, space_after=60)
    body_xml += p("Vocês deverão agir como uma equipe profissional de Analistas de Requisitos. Não basta imaginar funcionalidades: é necessário investigar o problema, formular perguntas, identificar necessidades explícitas e implícitas, reconhecer conflitos e transformar as informações em requisitos claros e verificáveis.", size=20, space_after=140)

    # 4. Missão 1 — Identificação dos stakeholders
    body_xml += p("4. Missão 1 — Identificação dos stakeholders", bold=True, size=22, color="1E3A8A", space_before=140, space_after=60)
    body_xml += p("Stakeholders identificados pelo grupo (incluindo dois novos perfis essenciais):", size=20, space_after=80)

    sh_headers = ["Stakeholder", "O que espera do sistema?", "Qual problema possui?"]
    sh_rows = [
        [
            "Estudantes",
            "Querem ver pelo celular qual posição estão na fila, receber um aviso quando estiver perto da sua vez e não precisar ficar plantados esperando na secretaria.",
            "Ficam muito tempo em pé esperando, perdem o começo das aulas e nunca sabem que horas realmente vão ser atendidos."
        ],
        [
            "Atendentes da Secretaria",
            "Querem uma tela simples para chamar a próxima pessoa, organizar os atendimentos por assunto e não ter aquela aglomeração cheia de gente reclamando no balcão.",
            "Trabalham sobrecarregados, sofrem com a bagunça no saguão e perdem tempo chamando senhas de pessoas que já foram embora."
        ],
        [
            "Gestores da Universidade (Diretoria)",
            "Querem acabar com as filas e reclamações, melhorar a imagem da faculdade e ter relatórios para saber o tempo que cada atendimento demora.",
            "Não têm números nem dados para saber se o atendimento está bom ou se precisa colocar mais atendentes em horários de pico."
        ],
        [
            "Equipe de TI",
            "Querem um sistema que não caia nos dias de matrícula, que seja seguro e fácil de conectar com o sistema de alunos que a faculdade já usa.",
            "Medo do servidor travar com muitos acessos ao mesmo tempo e dificuldade de integrar com o sistema antigo da faculdade."
        ],
        [
            "Alunos com Deficiência / PCDs (Novo)",
            "Precisam de prioridade garantida na fila por lei, um aplicativo fácil de usar (com leitor de tela/letras grandes) e aviso no celular.",
            "Dificuldade física de ficar em pé ou esperando muito tempo, além de totens normais que muitas vezes não são acessíveis."
        ],
        [
            "Professores e Coordenadores (Novo)",
            "Querem que os alunos cheguem no horário da aula e não usem mais a desculpa de que estavam presos esperando na secretaria.",
            "Aulas interrompidas por alunos chegando atrasados por causa da demora no atendimento da secretaria."
        ]
    ]
    body_xml += table(sh_rows, [2200, 3580, 3580], sh_headers)
    body_xml += p("", space_after=140)

    # 5. Missão 2 — Elaboração das perguntas
    body_xml += p("5. Missão 2 — Elaboração das perguntas", bold=True, size=22, color="1E3A8A", space_before=140, space_after=60)
    body_xml += p("10 perguntas práticas feitas aos stakeholders para entender as regras e o funcionamento do sistema:", size=20, space_after=80)

    perguntas = [
        ("1. Prioridades: ", "Como vai funcionar a fila preferencial (PCDs, gestantes, idosos)? Vai ser chamada 1 preferencial para quantas normais?"),
        ("2. Tipos de Assunto: ", "A fila vai ser dividida por assunto (financeiro, notas, documentos) ou qualquer atendente faz tudo?"),
        ("3. Login do Aluno: ", "O aluno precisa logar com RA e senha no aplicativo ou qualquer pessoa pode pegar uma senha sem cadastro (ex: visitante)?"),
        ("4. Tempo de Espera no Guichê: ", "Se o atendente chamar o aluno e ele não aparecer na hora, quantos minutos ele espera antes de cancelar a senha?"),
        ("5. Pegar senha de longe: ", "O aluno vai poder pegar a senha de casa/ônibus ou ele precisa estar dentro da faculdade para conseguir entrar na fila?"),
        ("6. Trocar de Guichê: ", "Se o aluno for no guichê errado, o atendente consegue transferir ele para outro atendente sem ele ter que ir para o fim da fila?"),
        ("7. Dias de Pico: ", "Quantos alunos costumam ser atendidos por dia em época normal e quantos atendimentos acontecem nas semanas de matrícula?"),
        ("8. Formas de Aviso: ", "Como o aluno vai ser avisado? Vai ser notificação no celular, mensagem no WhatsApp, ou só pela TV com som no saguão?"),
        ("9. Relatórios para o Diretor: ", "Quais informações a diretoria quer ver no painel? (Ex: tempo médio de espera, horários com mais fila, quantidade de desistências)?"),
        ("10. Se a Internet Cair: ", "O que acontece se acabar a luz ou a internet da faculdade cair no meio do dia? O sistema consegue salvar a ordem da fila?")
    ]
    for num_title, text in perguntas:
        body_xml += p_runs([(num_title, True, False, 20, "1E3A8A"), (text, False, False, 20, "222222")], space_after=60)
    body_xml += p("", space_after=120)

    # 6. Missão 3 — Escolha das técnicas de levantamento
    body_xml += p("6. Missão 3 — Escolha das técnicas de levantamento", bold=True, size=22, color="1E3A8A", space_before=140, space_after=60)
    body_xml += p("Três técnicas escolhidas para descobrir os requisitos na prática:", size=20, space_after=80)

    tec_headers = ["Técnica", "Como seria utilizada no Fila+?", "Por que é adequada?"]
    tec_rows = [
        [
            "1. Entrevista",
            "Conversar cara a cara com os atendentes, o diretor e a equipe de TI com perguntas diretas sobre o dia a dia e as regras de atendimento.",
            "É a melhor forma de entender o que cada pessoa realmente precisa e tirar dúvidas sobre regras que não estão no papel."
        ],
        [
            "2. Observação Direta",
            "Passar algumas horas dentro da secretaria olhando o movimento real, cronometrando o tempo e vendo como os alunos se comportam.",
            "Permite enxergar problemas que ninguém conta nas entrevistas, como alunos que pegam a senha de papel e vão embora da faculdade."
        ],
        [
            "3. Prototipagem (Desenhar as telas)",
            "Fazer um desenho/modelo visual das telas do aplicativo e do painel do atendente para mostrar para eles antes de começar a programar.",
            "Ajuda os alunos e atendentes a verem como vai ficar na prática, evitando ter que refazer código depois por falta de entendimento."
        ]
    ]
    body_xml += table(tec_rows, [2200, 3580, 3580], tec_headers)
    body_xml += p("", space_after=140)

    # 7. Missão 4 — Requisitos Funcionais
    body_xml += p("7. Missão 4 — Requisitos Funcionais", bold=True, size=22, color="1E3A8A", space_before=140, space_after=60)
    body_xml += p("10 requisitos funcionais usando o padrão 'RFXX — O sistema deverá...':", size=20, space_after=80)

    rf_headers = ["ID", "Requisito Funcional"]
    rf_rows = [
        ["RF01", "O sistema deverá permitir que o aluno escolha o tipo de assunto que precisa resolver (ex: Financeiro, Documentos, Estágio) para pegar sua senha."],
        ["RF02", "O sistema deverá mostrar na tela do celular do aluno a posição dele na fila e uma estimativa de quanto tempo falta para ele ser chamado."],
        ["RF03", "O sistema deverá enviar uma notificação no celular do aluno quando faltarem 3 pessoas para a vez dele e quando a senha dele for chamada."],
        ["RF04", "O sistema deverá permitir que o atendente clique para chamar a próxima senha, rechamar a mesma senha ou finalizar o atendimento."],
        ["RF05", "O sistema deverá permitir que o aluno desista e cancele a sua senha pelo próprio aplicativo a qualquer momento."],
        ["RF06", "O sistema deverá separar as senhas normais das preferenciais (PCDs, idosos, gestantes) e intercalar as chamadas seguindo a lei."],
        ["RF07", "O sistema deverá mostrar na TV do saguão o número da senha chamada, o nome do aluno, o guichê e tocar um aviso sonoro."],
        ["RF08", "O sistema deverá permitir que o atendente transfira um aluno para outro guichê sem que o aluno tenha que ir pro fim da fila."],
        ["RF09", "O sistema deverá cancelar a senha do aluno automaticamente se ele for chamado 3 vezes e não aparecer no guichê em até 3 minutos."],
        ["RF10", "O sistema deverá gerar relatórios com gráficos mostrando o tempo médio de espera, tempo de atendimento e quantidade de faltas por dia."]
    ]
    body_xml += table(rf_rows, [1200, 8160], rf_headers)
    body_xml += p("", space_after=140)

    # 8. Missão 5 — Requisitos Não Funcionais
    body_xml += p("8. Missão 5 — Requisitos Não Funcionais", bold=True, size=22, color="1E3A8A", space_before=140, space_after=60)
    body_xml += p("10 requisitos não funcionais explicados com regras claras e fáceis de testar:", size=20, space_after=80)

    rnf_headers = ["ID", "Requisito Não Funcional (Critério Claro e Verificável)"]
    rnf_rows = [
        ["RNF01", "Tempo de Resposta: Quando o atendente chamar a próxima senha, a tela do celular do aluno deve atualizar em no máximo 2 segundos."],
        ["RNF02", "Disponibilidade: O sistema precisa funcionar sem cair em 99,5% do tempo durante o horário de aulas (das 7h às 22h30)."],
        ["RNF03", "Capacidade: O servidor deve aguentar pelo menos 1.000 alunos conectados no aplicativo ao mesmo tempo sem travar nos dias de matrícula."],
        ["RNF04", "Segurança dos Dados: O sistema não pode mostrar dados pessoais como CPF nas TVs públicas e deve proteger as informações dos alunos."],
        ["RNF05", "Acesso e Login: O sistema deve usar o mesmo login e senha que o aluno já usa no portal da faculdade, sem precisar criar outra conta."],
        ["RNF06", "Acessibilidade: O aplicativo deve ter opção de aumentar o tamanho da letra, modo de alto contraste e funcionar com leitores de tela para cegos."],
        ["RNF07", "Compatibilidade: O aplicativo deve funcionar em celulares Android (versão 8 em diante) e iPhone (iOS 14 em diante), e também no navegador."],
        ["RNF08", "Recuperação após Quedas: Se faltar luz ou o servidor reiniciar, o sistema deve recuperar a ordem das senhas em até 30 segundos sem perder nada."],
        ["RNF09", "Histórico e Auditoria: O sistema deve guardar o registro de todas as senhas chamadas, atendidas e canceladas por pelo menos 1 ano."],
        ["RNF10", "Entrega de Avisos: As notificações no celular do aluno devem chegar com sucesso em pelo menos 98% das vezes que forem enviadas."]
    ]
    body_xml += table(rnf_rows, [1400, 7960], rnf_headers)
    body_xml += p("", space_after=140)

    # 9. Missão 6 — Requisitos ambíguos
    body_xml += p("9. Missão 6 — Requisitos ambíguos", bold=True, size=22, color="1E3A8A", space_before=140, space_after=60)
    body_xml += p("Classificação de cada frase e como reescrever as que são vagas para ficarem fáceis de testar:", size=20, space_after=80)

    amb_headers = ["Item", "Frase Original", "Classificação", "Se for ambíguo: como reescrever"]
    amb_rows = [
        [
            "A",
            "O sistema deve ser rápido.",
            "Ambíguo / Incompleto",
            "Qualquer tela ou botão clicado no sistema deve responder em menos de 2 segundos na internet normal."
        ],
        [
            "B",
            "O aluno deverá conseguir acompanhar sua posição na fila.",
            "Requisito Funcional",
            "(Não é ambíguo) — O app deve mostrar o número da posição do aluno (ex: 'Você é o 4º') e atualizar a cada chamada."
        ],
        [
            "C",
            "O sistema deve ser seguro.",
            "Ambíguo / Incompleto",
            "O sistema deve exigir senha segura, proteger os dados dos alunos e não expor o CPF de ninguém nas telas."
        ],
        [
            "D",
            "O sistema deverá permitir que o aluno cancele sua senha.",
            "Requisito Funcional",
            "(Não é ambíguo) — O app deve ter um botão 'Cancelar Senha' com uma pergunta de confirmação antes de cancelar."
        ],
        [
            "E",
            "O sistema deverá ser fácil de utilizar.",
            "Ambíguo / Incompleto",
            "Qualquer aluno novo deve conseguir pegar uma senha no app em no máximo 3 cliques e menos de 45 segundos, sem precisar de ajuda."
        ],
        [
            "F",
            "O sistema deverá permitir que o atendente chame o próximo aluno.",
            "Requisito Funcional",
            "(Não é ambíguo) — A tela do atendente deve ter o botão 'Chamar Próximo', que atualiza a TV e avisa o aluno no celular."
        ]
    ]
    body_xml += table(amb_rows, [600, 2400, 2200, 4160], amb_headers)
    body_xml += p("", space_after=140)

    # 10. Missão 7 — O requisito escondido
    body_xml += p("10. Missão 7 — O requisito escondido", bold=True, size=22, color="1E3A8A", space_before=140, space_after=60)
    body_xml += p_runs([
        ("Situação que aconteceu: ", True, False, 20, "1E3A8A"),
        ("Ao acompanhar a secretaria, o grupo viu que muitos alunos pegavam a senha, saíam da faculdade e não voltavam quando eram chamados.", False, False, 20, "222222")
    ], space_after=80)

    body_xml += p_runs([
        ("Esse comportamento estava descrito no pedido inicial? ", True, False, 20, "1E3A8A"),
        ("NÃO.", True, False, 20, "B91C1C"),
        (" O pedido da faculdade falava apenas em 'diminuir filas e acompanhar pelo celular'.", False, False, 20, "222222")
    ], space_after=60)

    body_xml += p_runs([
        ("Esse problema deveria gerar novos requisitos? Explique:\n", True, False, 20, "1E3A8A"),
        ("SIM. Se os alunos pegarem a senha e forem embora, o atendente vai ficar chamando o nada no guichê. Isso faz o atendente perder tempo, bagunça a previsão de horário dos outros alunos que estão esperando e deixa todo mundo irritado. Por isso, precisamos criar regras no sistema para lidar com isso.", False, False, 20, "222222")
    ], space_after=80)

    body_xml += p("Dois novos requisitos criados para resolver esse problema:", bold=True, size=20, color="1E3A8A", space_after=60)
    body_xml += p_runs([
        ("1. RF_NOVO01 (Confirmar que já chegou): ", True, False, 20, "1E3A8A"),
        ("Quando faltarem 5 posições para a vez do aluno, o aplicativo deve pedir para ele clicar em 'Confirmar Presença' (comprovando que já está na faculdade pelo GPS ou QR Code). Se ele não confirmar em 5 minutos, a senha dele vai para o fim da fila.", False, False, 20, "222222")
    ], space_after=60)
    body_xml += p_runs([
        ("2. RF_NOVO02 (Cancelar quem sumir): ", True, False, 20, "1E3A8A"),
        ("Se o aluno for chamado no guichê e não aparecer em até 2 minutos após 2 chamadas, o sistema cancela a senha dele automaticamente e já libera o atendente para chamar a próxima pessoa.", False, False, 20, "222222")
    ], space_after=140)

    # 11. Missão 8 — Conflito entre stakeholders
    body_xml += p("11. Missão 8 — Conflito entre stakeholders", bold=True, size=22, color="1E3A8A", space_before=140, space_after=60)
    body_xml += p("O diretor quer que o aluno possa entrar na fila de qualquer lugar pelo celular. O atendente é contra, porque diz que muita gente vai entrar e não vai aparecer. O aluno quer muito poder pegar de longe para não perder tempo esperando.", size=20, space_after=80)

    body_xml += p_runs([
        ("Existe um conflito de requisitos? Explique:\n", True, False, 20, "1E3A8A"),
        ("SIM. O diretor e o aluno querem o máximo de comodidade (pegar a senha de casa), mas o atendente quer que a pessoa só pegue se estiver presente, para não ficar chamando senha de quem não veio.", False, False, 20, "222222")
    ], space_after=80)

    body_xml += p_runs([
        ("Quais stakeholders estão envolvidos?\n", True, False, 20, "1E3A8A"),
        ("O Diretor da faculdade, os Estudantes e os Atendentes da secretaria.", False, False, 20, "222222")
    ], space_after=80)

    body_xml += p_runs([
        ("Qual solução o grupo propõe?\n", True, False, 20, "1E3A8A"),
        ("A solução é um meio-termo inteligente: O aluno PODE pegar a senha de casa ou do ônibus no celular. O aplicativo mostra quanto tempo falta. Mas, quando faltar 15 minutos (ou 5 pessoas na frente dele), o app manda um aviso dizendo: 'Você precisa confirmar que já está na faculdade'. Se ele estiver no campus e confirmar no app, ele continua na fila e é chamado normalmente no guichê. Se ele não confirmar a tempo, a senha dele é cancelada para não atrapalhar o atendente nem os outros alunos.", False, False, 20, "222222")
    ], space_after=80)

    body_xml += p_runs([
        ("Essa solução gera novos requisitos? Quais?\n", True, False, 20, "1E3A8A"),
        ("SIM, gera 3 novas regras no sistema:\n", False, False, 20, "222222"),
        ("• RF_CONF01: ", True, False, 20, "1E3A8A"),
        ("O sistema deverá permitir que o aluno pegue a senha de onde estiver pelo celular, mostrando a previsão de horário para ele chegar à faculdade.\n", False, False, 20, "222222"),
        ("• RF_CONF02: ", True, False, 20, "1E3A8A"),
        ("O sistema deverá exigir que o aluno confirme presença (via GPS do celular ou lendo um QR Code no saguão) 15 minutos antes da vez dele.\n", False, False, 20, "222222"),
        ("• RF_CONF03: ", True, False, 20, "1E3A8A"),
        ("O sistema deverá cancelar a senha automaticamente se o aluno não confirmar que chegou dentro do prazo estipulado.", False, False, 20, "222222")
    ], space_after=140)

    # 12. Entrega final
    body_xml += p("12. Entrega final (Checklist)", bold=True, size=22, color="1E3A8A", space_before=140, space_after=60)
    body_xml += p("Confirmação de todos os itens pedidos na atividade:", size=20, space_after=80)

    checklist_items = [
        "[X] Pelo menos 6 stakeholders identificados.",
        "[X] 10 perguntas de levantamento elaboradas.",
        "[X] 3 técnicas de levantamento explicadas.",
        "[X] 10 requisitos funcionais definidos.",
        "[X] 10 requisitos não funcionais com regras claras.",
        "[X] Classificação e correção dos requisitos ambíguos.",
        "[X] 2 requisitos implícitos/escondidos identificados.",
        "[X] Explicação do conflito entre stakeholders.",
        "[X] Solução prática para resolver o conflito.",
        "[X] Reflexão final respondida."
    ]
    for chk in checklist_items:
        body_xml += p_runs([(chk[:3], True, False, 20, "16A34A"), (chk[3:], False, False, 20, "222222")], space_after=40)
    body_xml += p("", space_after=120)

    # 13. Reflexão final
    body_xml += p("13. Reflexão final", bold=True, size=22, color="1E3A8A", space_before=140, space_after=60)
    body_xml += p_runs([
        ("Por que não seria adequado iniciar o desenvolvimento do Fila+ apenas com a frase: 'Precisamos de um sistema moderno para diminuir as filas'?\n", True, False, 20, "1E3A8A"),
        ("Porque essa frase é só uma vontade solta, não uma explicação de como o sistema deve funcionar. Ela não explica nenhuma regra de negócio (como funcionam as prioridades, como cancelar uma senha, o que fazer se o aluno faltar, ou como o atendente chama). Se a gente começasse a programar direto só com essa frase, cada pessoa da equipe ia imaginar o sistema de um jeito diferente. O resultado seria um código cheio de erros, perda de tempo e a entrega de um programa que não ia resolver a bagunça da secretaria.", False, False, 20, "222222")
    ], space_after=140)

    # 14. Desafio final para discussão em sala
    body_xml += p("14. Desafio final para discussão em sala", bold=True, size=22, color="1E3A8A", space_before=140, space_after=60)
    body_xml += p_runs([
        ("Por que os requisitos podem ser diferentes mesmo quando o problema analisado é o mesmo?\n", True, False, 20, "1E3A8A"),
        ("Porque cada grupo de analistas foca em um ponto de vista diferente. Um grupo pode focar mais no conforto do aluno (querendo que ele faça tudo pelo celular), outro grupo pode focar na rotina do atendente (para ele não se sobrecarregar), e outro pode focar na segurança e no servidor da TI. Como cada equipe conversa com pessoas diferentes e imagina soluções diferentes para os mesmos problemas, a lista de requisitos finais sempre vai ter diferenças.", False, False, 20, "222222")
    ], space_after=180)

    body_xml += callout_box("Dica Final:", "Bom trabalho! Lembre-se: antes de desenvolver, é preciso entender o problema.")

    doc_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        {body_xml}
        <w:sectPr>
            <w:pgSz w:w="11906" w:h="16838"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
            <w:cols w:space="720"/>
            <w:docGrid w:linePitch="360"/>
        </w:sectPr>
    </w:body>
</w:document>"""

    with zipfile.ZipFile(filename, "w", zipfile.ZIP_DEFLATED) as docx:
        docx.writestr("[Content_Types].xml", content_types)
        docx.writestr("_rels/.rels", package_rels)
        docx.writestr("word/_rels/document.xml.rels", doc_rels)
        docx.writestr("word/styles.xml", styles_xml)
        docx.writestr("word/document.xml", doc_xml)

if __name__ == "__main__":
    out_dir = r"c:\Users\Mais_40351\.gemini\antigravity\scratch\Limbus"
    out_file = os.path.join(out_dir, "LEVANTAMENTO_DE_REQUISITOS_SISTEMA_FILA_PLUS.docx")
    create_simplified_docx(out_file)
    print("SUCCESS: Simplified Word file generated at", out_file)
