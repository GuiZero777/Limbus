// js/print.js

const generateAndPrintTermo = (funcionario, empresa, equipamentos, dataEntrega) => {
    // Use provided delivery date or fall back to admission date
    const dataEquipamento = dataEntrega || funcionario.dataAdmissao;
    // Determine today's date
    const today = new Date();

    // Construct the print layout HTML
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
        alert('Por favor, permita pop-ups para imprimir o termo.');
        return;
    }

    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Termo de Responsabilidade - ${funcionario.nome}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Arial:wght@400;700&display=swap');
            
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 40px;
                color: #000;
                line-height: 1.4;
            }
            .header {
                text-align: center;
                margin-bottom: 25px;
            }
            .title {
                font-size: 12pt;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .subtitle {
                font-size: 11pt;
                font-weight: bold;
            }
            .identificacao {
                margin-bottom: 20px;
                font-size: 10pt;
            }
            .identificacao p {
                margin: 3px 0;
            }
            .content {
                font-size: 10pt;
                text-align: justify;
                margin-bottom: 15px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
            }
            th, td {
                border: 1px solid #000;
                padding: 6px;
                text-align: center;
                font-size: 10pt;
            }
            th {
                font-weight: bold;
                text-align: center;
            }
            .terms {
                font-size: 10pt;
                text-align: justify;
                margin-bottom: 40px;
            }
            .terms ol {
                padding-left: 0;
                list-style-type: none;
                margin-top: 5px;
            }
            .terms li {
                margin-bottom: 8px;
                position: relative;
                padding-left: 20px;
                line-height: 1.3;
            }
            .terms li::before {
                content: counter(item) "- ";
                counter-increment: item;
                position: absolute;
                left: 0;
            }
            .terms ol {
                counter-reset: item;
            }
            .signature-section {
                width: 100%;
                margin-top: 40px;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .signature-line {
                width: 50%;
                border-top: 1px solid #000;
                margin-bottom: 5px;
            }
            .signature-name {
                font-weight: bold;
                font-size: 10pt;
            }
            .date-location {
                text-align: left;
                margin-bottom: 30px;
                font-size: 10pt;
            }

            .print-btn-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #fff;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .print-btn {
                background-color: #2563eb;
                color: white;
                border: none;
                padding: 10px 20px;
                font-size: 14px;
                border-radius: 5px;
                cursor: pointer;
                font-family: Arial, sans-serif;
            }
            
            @media print {
                body {
                    padding: 0;
                    margin: 2cm;
                }
                @page {
                    size: A4;
                    margin: 0;
                }
                .print-btn-container {
                    display: none;
                }
            }
        </style>
    </head>
    <body onload="window.print();">
        
        <div class="header">
            <div class="title">TERMO DE RESPONSABILIDADE PELA GUARDA E USO DE EQUIPAMENTO DE TRABALHO</div>
            <div class="subtitle">IDENTIFICAÇÃO DO EMPREGADO</div>
        </div>

        <div class="identificacao">
            <p><strong>NOME: </strong><strong style="text-transform: uppercase;">${funcionario.nome}</strong></p>
            <p><strong>FUNÇÃO: </strong><strong style="text-transform: uppercase;">${funcionario.funcao}</strong></p>
            <p><strong>DATA ADMISSÃO: </strong><strong>${formatInputDate(funcionario.dataAdmissao)}</strong></p>
        </div>

        <div class="content">
            <p>
                Recebi da empresa <strong>${empresa.nome}</strong>, inscrita no CNPJ/MF sob o nº. <strong>${formatCNPJ(empresa.cnpj)}</strong>, para uso
                exclusivo no exercício de minhas funções, conforme determinado em lei, os equipamentos especificados
                neste termo de responsabilidade, comprometendo-me a mantê-los em perfeito estado de conservação,
                ficando ciente de que:
            </p>
        </div>

        <div class="terms">
            <ol>
                <li>Se o equipamento for danificado ou inutilizado por emprego inadequado, mau uso, negligência ou extravio, a empresa me fornecerá novo equipamento e cobrará o valor de um equipamento da mesma marca ou equivalente, podendo, inclusive, descontar diretamente do meu salário, desde que o desconto mensal não seja superior a 30% do salário bruto. E se, caso o desconto num mês não suprir o valor do equipamento reposto, a empresa poderá fazer quantos descontos no salário forem necessários, dentro do limite mensal, até o ressarcimento total do equipamento substituído. Ainda, em eventual rescisão do contrato, caso as parcelas não tenham sido completamente quitadas, fica autorizado a compensação de todas as parcelas restantes, mesmo que ainda não tenham vencido, com as eventuais verbas rescisórias devidas, respeitados os limites legais.</li>
                <li>Em caso de dano, inutilização, ou extravio do equipamento deverei comunicar imediatamente ao setor competente.</li>
                <li>Terminando os serviços ou no caso de rescisão do contrato de trabalho, devolverei o equipamento completo e em perfeito estado de conservação, considerando-se o tempo do uso do mesmo (tempo de vida útil), ao setor competente.</li>
                <li>Estando os equipamentos em minha posse, estarei sujeito a inspeções sem prévio aviso.</li>
            </ol>
        </div>

        <table>
            <thead>
                <tr>
                    <th width="40%">DESCRIÇÃO DO EQUIPAMENTO</th>
                    <th width="25%">MODELO/MARCA</th>
                    <th width="15%">DATA</th>
                    <th width="20%">ASSINATURA</th>
                </tr>
            </thead>
            <tbody>
                ${equipamentos.map(eq => `
                    <tr>
                        <td>${eq.descricao}</td>
                        <td>${eq.modeloMarca}</td>
                        <td><strong>${formatInputDate(dataEquipamento)}</strong></td>
                        <td></td>
                    </tr>
                `).join('')}
                ${Array(Math.max(0, 5 - equipamentos.length)).fill(`
                    <tr>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="date-location">
            ${empresa.cidade}-${empresa.uf}, ${today.getDate().toString().padStart(2, '0')} de ${['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'][today.getMonth()]} de ${today.getFullYear()}.
        </div>

        <div class="signature-section">
            <div class="signature-line"></div>
            <div class="signature-name">Assinatura do funcionário</div>
        </div>

        <div class="print-btn-container">
            <button class="print-btn" onclick="window.print()">Imprimir PDF novamente</button>
        </div>

    </body>
    </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
};
