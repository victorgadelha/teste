import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import * as XLSX from "xlsx";

const AnaliseDadosNordeste = () => {
  const [loading, setLoading] = useState(true);
  const [dadosGerais, setDadosGerais] = useState({
    totalRegistros: 0,
    totalNordeste: 0,
    percentualNordeste: 0,
  });
  const [dadosEstados, setDadosEstados] = useState([]);
  const [dadosTitulacao, setDadosTitulacao] = useState([]);
  const [dadosAnos, setDadosAnos] = useState([]);
  const [dadosDependencia, setDadosDependencia] = useState([]);
  const [dadosGenero, setDadosGenero] = useState([]);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const response = await fetch("/Planilha - Dados BDTD, CAPES.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Estados do Nordeste
        const estadosNordeste = [
          "BA",
          "PE",
          "CE",
          "MA",
          "PB",
          "RN",
          "AL",
          "SE",
          "PI",
        ];

        // Filtrar dados apenas da região Nordeste
        const dadosNordeste = jsonData.filter((row) =>
          estadosNordeste.includes(row.Estado)
        );

        // Dados gerais
        setDadosGerais({
          totalRegistros: jsonData.length,
          totalNordeste: dadosNordeste.length,
          percentualNordeste: (
            (dadosNordeste.length / jsonData.length) *
            100
          ).toFixed(2),
        });

        // Dados por estado
        const dadosEstadosTemp = [];
        estadosNordeste.forEach((estado) => {
          const quantidade = dadosNordeste.filter(
            (row) => row.Estado === estado
          ).length;
          if (quantidade > 0) {
            dadosEstadosTemp.push({
              estado,
              quantidade,
              percentual: ((quantidade / dadosNordeste.length) * 100).toFixed(
                2
              ),
            });
          }
        });
        setDadosEstados(dadosEstadosTemp);

        // Dados por titulação
        const titulacoes = {};
        dadosNordeste.forEach((row) => {
          const titulacao = row["Grau de Titulação"];
          titulacoes[titulacao] = (titulacoes[titulacao] || 0) + 1;
        });

        const dadosTitulacaoTemp = Object.keys(titulacoes).map((key) => ({
          nome: key,
          quantidade: titulacoes[key],
          percentual: ((titulacoes[key] / dadosNordeste.length) * 100).toFixed(
            2
          ),
        }));
        setDadosTitulacao(dadosTitulacaoTemp);

        // Dados por ano
        const anos = {};
        dadosNordeste.forEach((row) => {
          const ano = row.Ano.toString();
          anos[ano] = (anos[ano] || 0) + 1;
        });

        const dadosAnosTemp = Object.keys(anos)
          .sort()
          .map((key) => ({
            ano: key,
            quantidade: anos[key],
          }));
        setDadosAnos(dadosAnosTemp);

        // Dados por dependência administrativa
        const dependencias = {};
        dadosNordeste.forEach((row) => {
          const dependencia = row["Dependência Administrativa"];
          dependencias[dependencia] = (dependencias[dependencia] || 0) + 1;
        });

        const dadosDependenciaTemp = Object.keys(dependencias).map((key) => ({
          nome: key,
          quantidade: dependencias[key],
          percentual: (
            (dependencias[key] / dadosNordeste.length) *
            100
          ).toFixed(2),
        }));
        setDadosDependencia(dadosDependenciaTemp);

        // Dados por gênero
        const generos = {};
        dadosNordeste.forEach((row) => {
          const genero =
            row["Gênero "] === "F"
              ? "Feminino"
              : row["Gênero "] === "M"
              ? "Masculino"
              : row["Gênero "];
          generos[genero] = (generos[genero] || 0) + 1;
        });

        const dadosGeneroTemp = Object.keys(generos).map((key) => ({
          nome: key,
          quantidade: generos[key],
          percentual: ((generos[key] / dadosNordeste.length) * 100).toFixed(2),
        }));
        setDadosGenero(dadosGeneroTemp);

        setLoading(false);
      } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Carregando dados...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Análise de Dados BDTD CAPES - Região Nordeste
      </h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">Dados Gerais</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-sm text-gray-600">Total de Registros</div>
            <div className="text-2xl font-bold">
              {dadosGerais.totalRegistros}
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-sm text-gray-600">Registros do Nordeste</div>
            <div className="text-2xl font-bold">
              {dadosGerais.totalNordeste}
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-sm text-gray-600">Percentual do Nordeste</div>
            <div className="text-2xl font-bold">
              {dadosGerais.percentualNordeste}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Estado */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">
            Distribuição por Estado do Nordeste
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={dadosEstados}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="estado" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantidade" fill="#8884d8" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por Grau de Titulação */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">
            Distribuição por Grau de Titulação
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosTitulacao}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                dataKey="quantidade"
                nameKey="nome"
                label={({ nome, percentual }) => `${percentual}%`}
              >
                {dadosTitulacao.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por Ano */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Distribuição por Ano</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={dadosAnos}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ano" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#82ca9d" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por Dependência Administrativa */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">
            Dependência Administrativa
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosDependencia}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                dataKey="quantidade"
                nameKey="nome"
                label={({ nome, percentual }) => `${percentual}%`}
              >
                {dadosDependencia.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por Gênero */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">
            Distribuição por Gênero
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosGenero}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                dataKey="quantidade"
                nameKey="nome"
                label={({ nome, percentual }) => `${percentual}%`}
              >
                {dadosGenero.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnaliseDadosNordeste;
