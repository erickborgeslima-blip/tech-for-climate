const formulario = document.querySelector("form");

let latitude = null;
let longitude = null;
let ocorrenciaEditando = null;

// Guarda os marcadores das ocorrências
let marcadoresOcorrencias = [];

// Guarda o marcador da localização do usuário
let marcadorLocalizacao = null;


// =====================================================
// FORMULÁRIO - REGISTRAR OCORRÊNCIA
// =====================================================

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    const tipo = document.getElementById("tipo").value;
    const nivel = document.getElementById("nivel").value;
    const tipoRua = document.getElementById("tipoRua").value;
    const statusPassagem = document.getElementById("statusPassagem").value;
    const cidade = document.getElementById("cidade").value;
    const local = document.getElementById("local").value;

    const ocorrencia = {
        tipo: tipo,
        nivel: nivel,
        tipoRua: tipoRua,
        statusPassagem: statusPassagem,
        cidade: cidade,
        local: local,   
        latitude: latitude,
        longitude: longitude
        
    };

    const dadosJSON = JSON.stringify(ocorrencia);

    console.log("JSON da ocorrência:", dadosJSON);
    console.log("Ocorrência:", ocorrencia);


    // =====================================================
    // EDITAR OCORRÊNCIA
    // =====================================================

    if (ocorrenciaEditando !== null) {

        fetch(`http://localhost:3000/ocorrencias/${ocorrenciaEditando}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: dadosJSON

        })

        .then(response => response.json())

        .then(data => {

            console.log("Resposta da API:", data);

            alert("✏️ Ocorrência atualizada com sucesso!");

            // Sai do modo de edição
            ocorrenciaEditando = null;

            // Volta o botão ao normal
            const botaoFormulario =
                document.querySelector(
                    '.registro button[type="submit"]'
                );

            botaoFormulario.textContent =
                "Registrar ocorrência";

            // Limpa o formulário
            formulario.reset();

            latitude = null;
            longitude = null;

            document.getElementById(
                "localizacaoTexto"
            ).textContent =
                "Localização não informada";

            // Atualiza tudo
            carregarOcorrencias();
            atualizarMapa();
            atualizarIndicadores();
            atualizarGrafico();
            atualizarAlerta();

        })

        .catch(error => {

            console.error(
                "❌ Erro ao atualizar ocorrência:",
                error
            );

        });

        return;
    }


    // =====================================================
    // NOVA OCORRÊNCIA
    // =====================================================

    fetch("http://localhost:3000/ocorrencias", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: dadosJSON

    })

    .then(response => response.json())

    .then(data => {

        console.log("Resposta da API:", data);

        // Atualiza tudo
        atualizarMapa();
        carregarOcorrencias();
        atualizarIndicadores();
        atualizarGrafico();
        atualizarAlerta();

        alert("✅ Ocorrência registrada com sucesso!");

    })

    .catch(error => {

        console.error(
            "❌ Erro ao enviar ocorrência:",
            error
        );

    });

});

// =====================================================
// CARREGAR OCORRÊNCIAS NA LISTA
// =====================================================

async function carregarOcorrencias() {

    const container = document.getElementById("ocorrencias-container");
    const proximas = document.getElementById("ocorrencias-proximas");

    try {

        const resposta = await fetch(
            "http://localhost:3000/ocorrencias"
        );

        const ocorrencias = await resposta.json();

        // Mostra a ocorrência mais recente na seção "Ocorrências próximas"
if (ocorrencias.length > 0) {

    const ocorrencia = ocorrencias[0];

    proximas.innerHTML = `
        <div class="ocorrencia">

            <h3>🚨 ${ocorrencia.tipo}</h3>

            <p>
                📍 ${ocorrencia.cidade}
            </p>

            <p>🏠 Local: ${ocorrencia.local || "Não informado"}</p>

            <p>
                ⚠️ Nível: ${ocorrencia.nivel}
            </p>

            <p>🛣️ Rua: ${ocorrencia.tipo_rua}</p>

            <p>
                🚗 Passagem: ${ocorrencia.status_passagem}
            </p>

        </div>
    `;

} else {

    proximas.innerHTML =
        "<p>✅ Nenhuma ocorrência registrada.</p>";
}

        container.innerHTML = "";

        if (ocorrencias.length === 0) {

            container.innerHTML =
                "<p>Nenhuma ocorrência registrada.</p>";

            return;
        }

        ocorrencias.forEach(ocorrencia => {

            const card = document.createElement("div");

            card.classList.add("card-ocorrencia");

            card.innerHTML = `
                <h3>🚨 ${ocorrencia.tipo}</h3>

                <p>
                    <strong>Cidade:</strong>
                    ${ocorrencia.cidade}
                </p>

                <p>
                    <strong>Bairro/Rua:</strong>
                    ${ocorrencia.local || "Não informado"}
                </p>

                <p>
                    <strong>Nível:</strong>
                    ${ocorrencia.nivel}
                </p>

                <p>
                    <strong>Rua:</strong>
                    ${ocorrencia.tipo_rua}
                </p>

                <p>
                    <strong>Passagem:</strong>
                    ${ocorrencia.status_passagem}
                </p>

                <p>
                    <strong>Comentário:</strong>
                    ${ocorrencia.comentario || "Nenhum comentário"}
                </p>

                <div class="acoes-ocorrencia">

                    <button 
                        type="button"
                        onclick="editarOcorrencia(${ocorrencia.id})">
                        ✏️ Editar
                    </button>

                    <button 
                        type="button"
                        onclick="excluirOcorrencia(${ocorrencia.id})">
                        🗑️ Excluir
                    </button>

                </div>
            `;

            container.appendChild(card);

        });

    } catch (erro) {

        console.error(
            "Erro ao carregar ocorrências:",
            erro
        );

        container.innerHTML =
            "<p>❌ Não foi possível carregar as ocorrências.</p>";
    }
}

// =====================================================
// EXCLUIR OCORRÊNCIA
// =====================================================

async function excluirOcorrencia(id) {

    const confirmar = confirm(
        "Tem certeza que deseja excluir esta ocorrência?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const resposta = await fetch(
            `http://localhost:3000/ocorrencias/${id}`,
            {
                method: "DELETE"
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {

            alert(
                resultado.mensagem ||
                "Erro ao excluir ocorrência."
            );

            return;
        }

        alert("🗑️ Ocorrência excluída com sucesso!");

        // Atualiza a lista
        carregarOcorrencias();

        // Atualiza o mapa
        atualizarMapa();

        // Atualiza os indicadores
        atualizarIndicadores();

        // Atualiza o gráfico
        atualizarGrafico();

        // Atualiza o alerta
        atualizarAlerta();

    } catch (erro) {

        console.error(
            "❌ Erro ao excluir ocorrência:",
            erro
        );

        alert(
            "❌ Não foi possível excluir a ocorrência."
        );
    }
}

// =====================================================
// EDITAR OCORRÊNCIA
// =====================================================

async function editarOcorrencia(id) {

    try {

        const resposta = await fetch(
            "http://localhost:3000/ocorrencias"
        );

        const ocorrencias = await resposta.json();

        const ocorrencia = ocorrencias.find(
            item => item.id === id
        );

        if (!ocorrencia) {

            alert("❌ Ocorrência não encontrada.");

            return;
        }

        // Guarda o ID que está sendo editado
        ocorrenciaEditando = id;

        // Preenche o formulário
        document.getElementById("tipo").value =
            ocorrencia.tipo;

        document.getElementById("nivel").value =
            ocorrencia.nivel;

        document.getElementById("tipoRua").value =
            ocorrencia.tipo_rua;

        document.getElementById("statusPassagem").value =
            ocorrencia.status_passagem;

        document.getElementById("cidade").value =
            ocorrencia.cidade;

        document.getElementById("local").value = ocorrencia.local || "";

        document.getElementById("comentario").value =
            ocorrencia.comentario || "";

        // Recupera localização
        latitude = ocorrencia.latitude;
        longitude = ocorrencia.longitude;

        const textoLocalizacao =
            document.getElementById("localizacaoTexto");

        if (latitude !== null && longitude !== null) {

            textoLocalizacao.textContent =
                `📍 Localização: ${latitude}, ${longitude}`;

        } else {

            textoLocalizacao.textContent =
                "📍 Localização não informada";
        }

        // Muda o texto do botão
        const botaoFormulario =
            document.querySelector(
                '.registro button[type="submit"]'
            );

        botaoFormulario.textContent =
            "Atualizar ocorrência";

        // Vai até o formulário
        document.querySelector(".registro").scrollIntoView({
            behavior: "smooth"
        });

    } catch (erro) {

        console.error(
            "❌ Erro ao carregar ocorrência para edição:",
            erro
        );

        alert(
            "❌ Não foi possível carregar a ocorrência."
        );
    }
}

// =====================================================
// MAPA
// =====================================================

const mapa = L.map("mapa").setView(
    [-25.2218, -49.3568],
    12
);


// Mapa de ruas
L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(mapa);


// =====================================================
// LOCALIZAÇÃO AUTOMÁTICA
// =====================================================

if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(

        function(posicao) {

            const lat =
                posicao.coords.latitude;

            const lng =
                posicao.coords.longitude;

            marcadorLocalizacao =
                L.marker([lat, lng])
                    .addTo(mapa);

            marcadorLocalizacao.bindPopup(`
                <strong>📍 Você está aqui</strong>
            `);

            mapa.setView(
                [lat, lng],
                14
            );

        },

        function(erro) {

            console.error(
                "Não foi possível obter sua localização:",
                erro
            );

        }
    );

} else {

    console.error(
        "Geolocalização não é suportada pelo navegador."
    );

}

// =====================================================
// BOTÃO USAR MINHA LOCALIZAÇÃO
// =====================================================

const btnLocalizacao = document.getElementById("btnLocalizacao");
const localizacaoTexto = document.getElementById("localizacaoTexto");

btnLocalizacao.addEventListener("click", function () {

    if (!navigator.geolocation) {

        localizacaoTexto.textContent =
            "❌ Seu navegador não suporta localização.";

        return;
    }

    localizacaoTexto.textContent =
        "📍 Obtendo sua localização...";

    navigator.geolocation.getCurrentPosition(

        function(posicao) {

            latitude = posicao.coords.latitude;
            longitude = posicao.coords.longitude;

            localizacaoTexto.textContent =
                `📍 Localização encontrada: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

            // Remove marcador anterior
            if (marcadorLocalizacao) {
                mapa.removeLayer(marcadorLocalizacao);
            }

            // Cria novo marcador
            marcadorLocalizacao = L.marker([
                latitude,
                longitude
            ]).addTo(mapa);

            marcadorLocalizacao.bindPopup(
                "<strong>📍 Você está aqui</strong>"
            ).openPopup();

            // Centraliza o mapa
            mapa.setView(
                [latitude, longitude],
                14
            );

            console.log(
                "✅ Localização:",
                latitude,
                longitude
            );
        },

        function(erro) {

            console.error(
                "❌ Erro ao obter localização:",
                erro
            );

            localizacaoTexto.textContent =
                "❌ Não foi possível obter sua localização.";
        }
    );
});

// =====================================================
// ATUALIZAR MARCADORES DAS OCORRÊNCIAS
// =====================================================

async function atualizarMapa() {

    try {

        const resposta = await fetch(
            "http://localhost:3000/ocorrencias"
        );

        const ocorrencias =
            await resposta.json();


        // Remove os marcadores antigos
        marcadoresOcorrencias.forEach(
            marcador => {

                mapa.removeLayer(marcador);

            }
        );


        // Limpa a lista
        marcadoresOcorrencias = [];


        // Cria os novos marcadores
        ocorrencias.forEach(ocorrencia => {

            const lat =
                Number(ocorrencia.latitude);

            const lng =
                Number(ocorrencia.longitude);


            // Define a cor pelo nível
            let cor;

            if (ocorrencia.nivel === "baixo") {

                cor = "green";

            } else if (
                ocorrencia.nivel === "medio" ||
                ocorrencia.nivel === "médio"
            ) {

                cor = "orange";

            } else if (
                ocorrencia.nivel === "alto"
            ) {

                cor = "red";

            } else {

                cor = "blue";

            }


            // Ícone personalizado
            const icone = L.divIcon({

                className:
                    "marcador-alagamento",

                html: `
                    <div style="
                        background-color: ${cor};
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow:
                            0 0 5px rgba(0,0,0,0.5);
                    "></div>
                `,

                iconSize: [24, 24],

                iconAnchor: [12, 12]

            });


            // Cria o marcador
            const marcador =
                L.marker(
                    [lat, lng],
                    { icon: icone }
                ).addTo(mapa);


            // Informações do marcador
            marcador.bindPopup(`

                <strong>
                    🚨 ${ocorrencia.tipo}
                </strong>
                <br>

                <strong>
                    Cidade:
                </strong>
                ${ocorrencia.cidade}
                <br>

                <p>🏠 Local: ${ocorrencia.local || "Não informado"}</p>

                <strong>
                    Nível:
                </strong>
                ${ocorrencia.nivel}
                <br>

                <strong>
                    Passagem:
                </strong>
                ${ocorrencia.status_passagem}
                <br>

                <strong>
                    📅 Data e hora:
                </strong>
                ${new Date(ocorrencia.data_hora).toLocaleString("pt-BR")}
                <br>

                <strong>
                    Comentário:
                </strong>
                ${ocorrencia.comentario || "Nenhum comentário"}
                `);


            // Guarda o marcador
            marcadoresOcorrencias.push(
                marcador
            );

        });

        console.log(
            "✅ Mapa atualizado!"
        );

    } catch (erro) {

        console.error(
            "❌ Erro ao atualizar mapa:",
            erro
        );

    }

}


// =====================================================
// LEGENDA
// =====================================================

const legenda =
    L.control({
        position: "bottomright"
    });


legenda.onAdd = function() {

    const div =
        L.DomUtil.create(
            "div",
            "legenda"
        );

    div.innerHTML = `

        <strong>
            🗺️ Legenda
        </strong>

        <br>

        <span class="legenda-item">
            <span class="bolinha baixo"></span>
            Baixo
        </span>

        <br>

        <span class="legenda-item">
            <span class="bolinha medio"></span>
            Médio
        </span>

        <br>

        <span class="legenda-item">
            <span class="bolinha alto"></span>
            Alto
        </span>

        <br>

        <span class="legenda-item">
            📍 Sua localização
        </span>

    `;

    return div;
};


legenda.addTo(mapa);

// =====================================================
// ATUALIZAR INDICADORES
// =====================================================

async function atualizarIndicadores() {

    try {

        const resposta = await fetch(
            "http://localhost:3000/ocorrencias"
        );

        const ocorrencias = await resposta.json();

        console.log("DATA/HORA:", ocorrencias);

        // Total de ocorrências
        document.getElementById("totalOcorrencias").textContent =
            ocorrencias.length;


        // Conta cidades diferentes
        const cidades = new Set(
            ocorrencias.map(ocorrencia => ocorrencia.cidade)
        );

        document.getElementById("ruasAfetadas").textContent =
            cidades.size;


        // Descobre o maior nível de risco
        let nivelRisco = "Baixo";

        if (
            ocorrencias.some(ocorrencia =>
                ocorrencia.nivel === "alto"
            )
        ) {

            nivelRisco = "Alto";

        } else if (
            ocorrencias.some(ocorrencia =>
                ocorrencia.nivel === "medio" ||
                ocorrencia.nivel === "médio"
            )
        ) {

            nivelRisco = "Médio";
        }

        document.getElementById("nivelRisco").textContent =
            nivelRisco;

    } catch (erro) {

        console.error(
            "❌ Erro ao atualizar indicadores:",
            erro
        );

    }

}

// =====================================================
// ATUALIZAR GRÁFICO DE OCORRÊNCIAS
// =====================================================

async function atualizarGrafico() {

    try {

        const resposta = await fetch(
            "http://localhost:3000/ocorrencias"
        );

        const ocorrencias = await resposta.json();

        let baixo = 0;
        let medio = 0;
        let alto = 0;

        ocorrencias.forEach(ocorrencia => {

            const nivel = ocorrencia.nivel.toLowerCase();

            if (nivel === "baixo") {
                baixo++;
            }

            else if (
                nivel === "medio" ||
                nivel === "médio"
            ) {
                medio++;
            }

            else if (nivel === "alto") {
                alto++;
            }

        });

        // Mostra as quantidades
        document.getElementById("quantidadeBaixo").textContent = baixo;
        document.getElementById("quantidadeMedio").textContent = medio;
        document.getElementById("quantidadeAlto").textContent = alto;


        // Descobre o maior valor
        const maiorValor = Math.max(baixo, medio, alto, 1);


        // Calcula o tamanho das barras
        const porcentagemBaixo =
            (baixo / maiorValor) * 100;

        const porcentagemMedio =
            (medio / maiorValor) * 100;

        const porcentagemAlto =
            (alto / maiorValor) * 100;


        // Atualiza as barras
        document.getElementById("barraBaixo").style.width =
            porcentagemBaixo + "%";

        document.getElementById("barraMedio").style.width =
            porcentagemMedio + "%";

        document.getElementById("barraAlto").style.width =
            porcentagemAlto + "%";

    }

    catch (erro) {

        console.error(
            "❌ Erro ao atualizar gráfico:",
            erro
        );

    }

}

// =====================================================
// ATUALIZAR ALERTA
// =====================================================

async function atualizarAlerta() {

    try {

        const resposta = await fetch(
            "http://localhost:3000/ocorrencias"
        );

        const ocorrencias = await resposta.json();

        // Conta ocorrências de nível alto
        const ocorrenciasAltas = ocorrencias.filter(
            ocorrencia => ocorrencia.nivel.toLowerCase() === "alto"
        );

        // Conta locais onde não passa
        const naoPassa = ocorrencias.filter(
            ocorrencia => ocorrencia.status_passagem === "nao-passa"
        );


        const textoAlerta = document.getElementById("textoAlerta");
        const nivelAlerta = document.getElementById("nivelAlerta");


        // Se houver muitas ocorrências altas
        if (ocorrenciasAltas.length >= 10) {

            textoAlerta.textContent =
                `Foram registradas ${ocorrenciasAltas.length} ocorrências de nível alto na região.`;

            nivelAlerta.textContent =
                `🔴 Atenção: ${naoPassa.length} ocorrência(s) com passagem bloqueada.`;

        }

        // Se houver algumas ocorrências altas
        else if (ocorrenciasAltas.length >= 5) {

            textoAlerta.textContent =
                `Foram registradas ${ocorrenciasAltas.length} ocorrências de nível alto na região.`;

            nivelAlerta.textContent =
                "🟠 Cuidado ao circular pela região.";

        }

        // Poucas ocorrências altas
        else if (ocorrenciasAltas.length > 0) {

            textoAlerta.textContent =
                `Há ${ocorrenciasAltas.length} ocorrência(s) de nível alto registrada(s).`;

            nivelAlerta.textContent =
                "🟡 Atenção ao trânsito.";

        }

        // Nenhuma ocorrência alta
        else {

            textoAlerta.textContent =
                "Nenhuma ocorrência de nível alto registrada.";

            nivelAlerta.textContent =
                "🟢 Situação sem ocorrências graves.";

        }

    }

    catch (erro) {

        console.error(
            "❌ Erro ao atualizar alerta:",
            erro
        );

    }

}

// =====================================================
// CARREGA TUDO AO ABRIR A PÁGINA
// =====================================================

carregarOcorrencias();
atualizarMapa();
atualizarIndicadores();
atualizarGrafico();
atualizarAlerta();

// =====================================================
// CLIMA ATUAL DE ITAPERUÇU
// =====================================================

async function carregarClima() {

    try {

        const resposta = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=-25.22&longitude=-49.35&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&timezone=America%2FSao_Paulo"
        );

        const dados = await resposta.json();

        const clima = dados.current;

        // Temperatura
        document.getElementById("temperatura").textContent =
            `${Math.round(clima.temperature_2m)}°C`;

        // Chuva
        document.getElementById("chuva").textContent =
            `${clima.precipitation} mm`;

        // Vento
        document.getElementById("vento").textContent =
            `${Math.round(clima.wind_speed_10m)} km/h`;

        // Umidade
        document.getElementById("umidade").textContent =
            `${clima.relative_humidity_2m}%`;

        // Condição do tempo
        const condicao = document.getElementById("condicao");

        const codigo = clima.weather_code;

        if (codigo === 0) {

            condicao.textContent = "☀️ Céu limpo";

        } else if (codigo === 1 || codigo === 2 || codigo === 3) {

            condicao.textContent = "⛅ Parcialmente nublado";

        } else if (codigo === 45 || codigo === 48) {

            condicao.textContent = "🌫️ Neblina";

        } else if (
            codigo === 51 ||
            codigo === 53 ||
            codigo === 55 ||
            codigo === 56 ||
            codigo === 57
        ) {

            condicao.textContent = "🌦️ Chuvisco";

        } else if (
            codigo === 61 ||
            codigo === 63 ||
            codigo === 65 ||
            codigo === 66 ||
            codigo === 67
        ) {

            condicao.textContent = "🌧️ Chuva";

        } else if (
            codigo === 80 ||
            codigo === 81 ||
            codigo === 82
        ) {

            condicao.textContent = "🌧️ Pancadas de chuva";

        } else if (
            codigo === 95 ||
            codigo === 96 ||
            codigo === 99
        ) {

            condicao.textContent = "⛈️ Trovoada";

        } else {

            condicao.textContent = "🌤️ Condição atual";

        }

        console.log("🌤️ Clima atualizado!", clima);

    } catch (erro) {

        console.error("❌ Erro ao carregar clima:", erro);

        document.getElementById("condicao").textContent =
            "Não foi possível carregar o clima.";
    }

}


// Carrega o clima ao abrir a página
carregarClima();