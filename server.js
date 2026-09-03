const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// =====================================================
// CONEXÃO COM MYSQL
// =====================================================

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((erro) => {

    if (erro) {
        console.error("❌ Erro ao conectar ao MySQL:", erro.message);
        return;
    }

    console.log("✅ Conectado ao MySQL!");
});

// =====================================================
// ROTA INICIAL
// =====================================================

app.get("/", (req, res) => {

    res.json({
        mensagem: "API Tech for Climate funcionando!"
    });

});

// =====================================================
// CADASTRAR OCORRÊNCIA
// =====================================================

app.post("/ocorrencias", (req, res) => {

    const {
        tipo,
        tipoRua,
        nivel,
        comentario,
        latitude,
        longitude,
        statusPassagem,
        cidade,
        local
    } = req.body;

    const sql = `
        INSERT INTO ocorrencias
        (
            tipo,
            tipo_rua,
            nivel,
            comentario,
            latitude,
            longitude,
            data_hora,
            status_passagem,
            cidade,
            local
        )
        VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)
    `;

    const valores = [
        tipo,
        tipoRua,
        nivel,
        comentario,
        latitude,
        longitude,
        statusPassagem,
        cidade,
        local
    ];

    db.query(sql, valores, (erro, resultado) => {

        if (erro) {

            console.error(
                "❌ Erro ao salvar:",
                erro.message
            );

            return res.status(500).json({
                mensagem: "Erro ao salvar ocorrência."
            });
        }

        console.log(
            "✅ Ocorrência salva! ID:",
            resultado.insertId
        );

        res.json({
            mensagem: "Ocorrência registrada com sucesso!",
            id: resultado.insertId
        });

    });

});

// =====================================================
// BUSCAR TODAS AS OCORRÊNCIAS
// =====================================================

app.get("/ocorrencias", (req, res) => {

    const sql = `
        SELECT
            id,
            tipo,
            tipo_rua,
            nivel,
            comentario,
            latitude,
            longitude,
            data_hora,
            status_passagem,
            cidade,
            local
        FROM ocorrencias
        ORDER BY data_hora DESC
    `;

    db.query(sql, (erro, resultados) => {

        if (erro) {

            console.error(
                "❌ Erro ao buscar ocorrências:",
                erro.message
            );

            return res.status(500).json({
                mensagem: "Erro ao buscar ocorrências."
            });
        }

        res.json(resultados);

    });

});

// =====================================================
// ATUALIZAR OCORRÊNCIA
// =====================================================

// =====================================================
// ATUALIZAR OCORRÊNCIA
// =====================================================

app.put("/ocorrencias/:id", (req, res) => {

    const id = req.params.id;

    const {
        tipo,
        tipoRua,
        nivel,
        comentario,
        latitude,
        longitude,
        statusPassagem,
        cidade,
        local
    } = req.body;

    const sql = `
        UPDATE ocorrencias
        SET
            tipo = ?,
            tipo_rua = ?,
            nivel = ?,
            comentario = ?,
            latitude = ?,
            longitude = ?,
            status_passagem = ?,
            cidade = ?,
            local = ?
        WHERE id = ?
    `;

    const valores = [
        tipo,
        tipoRua,
        nivel,
        comentario,
        latitude,
        longitude,
        statusPassagem,
        cidade,
        local,
        id
    ];

    db.query(sql, valores, (erro, resultado) => {

        if (erro) {

            console.error(
                "❌ Erro ao atualizar:",
                erro.message
            );

            return res.status(500).json({
                mensagem: "Erro ao atualizar ocorrência."
            });
        }

        if (resultado.affectedRows === 0) {

            return res.status(404).json({
                mensagem: "Ocorrência não encontrada."
            });
        }

        console.log(
            "✅ Ocorrência atualizada! ID:",
            id
        );

        res.json({
            mensagem: "Ocorrência atualizada com sucesso!"
        });

    });

});
// =====================================================
// EXCLUIR OCORRÊNCIA
// =====================================================

app.delete("/ocorrencias/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        DELETE FROM ocorrencias
        WHERE id = ?
    `;

    db.query(sql, [id], (erro, resultado) => {

        if (erro) {

            console.error(
                "❌ Erro ao excluir:",
                erro.message
            );

            return res.status(500).json({
                mensagem: "Erro ao excluir ocorrência."
            });
        }

        if (resultado.affectedRows === 0) {

            return res.status(404).json({
                mensagem: "Ocorrência não encontrada."
            });
        }

        console.log(
            "🗑️ Ocorrência excluída! ID:",
            id
        );

        res.json({
            mensagem: "Ocorrência excluída com sucesso!"
        });

    });

});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Servidor funcionando em http://localhost:${PORT}`
    );

});
