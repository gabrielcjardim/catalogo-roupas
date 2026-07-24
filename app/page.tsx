"use client";

import { useState, useEffect } from 'react';

export default function Home() {
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");
  
  const [produtos, setProdutos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  const numeroWhatsApp = "5548998445112"; 

  // --- BUSCANDO DO SEU LINK CSV PUBLICADO ---
  useEffect(() => {
    const carregarPlanilha = async () => {
      try {
        // Seu link oficial publicado
        const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRYE6JPgdDHYWWMf7l4owsGL2wCSFV18861ZiKv2ae_ooALvxTI5YVLtTXjLg5cKA2ljtoDa_u1GdG2/pub?output=csv";
        
        const resposta = await fetch(url);
        const dadosCsv = await resposta.text();
        
        // Quebra o texto em linhas
        const linhas = dadosCsv.split(/\r?\n/);
        const produtosCarregados = [];

        // Começamos do i = 1 para pular a linha 0 (cabeçalho)
        for (let i = 1; i < linhas.length; i++) {
          if (!linhas[i].trim()) continue; // Pula linhas em branco

          // Esse "split" mágico separa as colunas por vírgula, 
          // mas IGNORA as vírgulas que estiverem dentro do preço (ex: "49,90")
          const colunas = linhas[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          
          // Função rápida para tirar as aspas extras de dentro do texto
          const limparTexto = (texto: string) => texto ? texto.replace(/(^"|"$)/g, '').trim() : '';

          const ativo = limparTexto(colunas[5]).toUpperCase();

          // Só adiciona o produto se a coluna F (ativo) for SIM
          if (ativo === 'SIM' || ativo === 'TRUE' || ativo === '1') {
            
            // Pega o valor e troca a vírgula por ponto para o JavaScript entender como moeda
            const valorRaw = limparTexto(colunas[4]);
            const precoFormatado = parseFloat(valorRaw.replace(',', '.'));

            produtosCarregados.push({
              id: limparTexto(colunas[0]),             // A: codprod
              nome: limparTexto(colunas[1]),           // B: nmprod
              categoria: limparTexto(colunas[2]) || "Geral", // C: categoria
              referencia: limparTexto(colunas[3]),     // D: referencia
              preco: isNaN(precoFormatado) ? 0 : precoFormatado, // E: valor
              imagem: limparTexto(colunas[6])          // G: Link da Foto
            });
          }
        }
        
        setProdutos(produtosCarregados);
        setCarregando(false);
      } catch (erro) {
        console.error("Erro ao carregar CSV:", erro);
        setCarregando(false);
      }
    };

    carregarPlanilha();
  }, []);

  // --- FILTROS E CATEGORIAS ---
  const categorias = ["Todas", ...Array.from(new Set(produtos.map((p) => p.categoria)))];

  const produtosFiltrados = categoriaSelecionada === "Todas" 
    ? produtos 
    : produtos.filter((p) => p.categoria === categoriaSelecionada);

  // --- LÓGICA DO CARRINHO ---
  const adicionarAoCarrinho = (produto: any) => {
    const itemExistente = carrinho.find((item) => item.id === produto.id);
    if (itemExistente) {
      const novoCarrinho = carrinho.map((item) => 
        item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
      );
      setCarrinho(novoCarrinho);
    } else {
      setCarrinho([...carrinho, { ...produto, quantidade: 1 }]);
    }
  };

  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('meu-catalogo-carrinho');
    if (carrinhoSalvo) setCarrinho(JSON.parse(carrinhoSalvo));
  }, []);

  useEffect(() => {
    localStorage.setItem('meu-catalogo-carrinho', JSON.stringify(carrinho));
  }, [carrinho]);

  const diminuirQuantidade = (id: string) => {
    const novoCarrinho = carrinho.map((item) => {
      if (item.id === id) return { ...item, quantidade: item.quantidade - 1 };
      return item;
    }).filter((item) => item.quantidade > 0);
    setCarrinho(novoCarrinho);
  };

  const removerDoCarrinho = (id: string) => {
    const novoCarrinho = carrinho.filter((item) => item.id !== id);
    setCarrinho(novoCarrinho);
  };

  const limparCarrinho = () => setCarrinho([]);

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  const quantidadeTotalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);

  const finalizarPedido = () => {
    if (carrinho.length === 0) return;
    let texto = "Olá! Gostaria de fechar o seguinte pedido:\n\n";
    carrinho.forEach((item) => {
      const subtotalItem = item.preco * item.quantidade;
      texto += `🛍️ ${item.quantidade}x *${item.nome}* - R$ ${subtotalItem.toFixed(2)}\n`;
    });
    texto += `\n💰 *Total do Orçamento: R$ ${calcularTotal().toFixed(2)}*`;
    const textoCodificado = encodeURIComponent(texto);
    const link = `https://wa.me/${numeroWhatsApp}?text=${textoCodificado}`;
    window.open(link, '_blank');
  };

  // --- TELA DE CARREGAMENTO ---
  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="mt-4 text-xl font-bold text-gray-700">Carregando Coleção...</h2>
      </div>
    );
  }

  // --- SE NÃO TIVER PRODUTOS ATIVOS ---
  if (!carregando && produtos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h2 className="mt-4 text-2xl font-bold text-gray-700">Nenhum produto ativo encontrado.</h2>
        <p className="text-gray-500 mt-2">Adicione produtos na planilha e marque a coluna Ativo como SIM.</p>
      </div>
    );
  }

  return (
    <main className="p-8 font-sans max-w-5xl mx-auto bg-gray-50 min-h-screen relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Nossa Coleção 👗</h1>
        <button 
          onClick={() => setMostrarCarrinho(!mostrarCarrinho)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-gray-700 transition-colors cursor-pointer"
        >
          🛒 {quantidadeTotalItens} {quantidadeTotalItens === 1 ? 'peça' : 'peças'}
        </button>
      </div>
      
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {categorias.map((categoria) => (
          <button
            key={categoria}
            onClick={() => setCategoriaSelecionada(categoria)}
            className={`px-5 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${
              categoriaSelecionada === categoria
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {categoria}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {produtosFiltrados.map((produto) => (
          <div key={produto.id} className="bg-white border p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
            
            <img 
              src={produto.imagem || "https://via.placeholder.com/500?text=Sem+Foto"} 
              alt={produto.nome}
              className="h-48 w-full object-cover mb-4 rounded-lg border border-gray-100"
              onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/500?text=Erro+na+Foto" }}
            />
            
            <div className="flex-grow">
              <h2 className="text-lg font-semibold text-gray-700">{produto.nome}</h2>
              <p className="text-sm text-gray-400 mb-2">{produto.categoria} | Ref: {produto.referencia}</p>
              <p className="text-xl font-bold text-green-600 mb-4">
                {/* Formatação para mostrar sempre duas casas decimais com vírgula */}
                R$ {produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <button 
              onClick={() => adicionarAoCarrinho(produto)}
              className="w-full bg-gray-100 text-gray-800 border border-gray-300 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors mt-auto active:bg-gray-300"
            >
              Adicionar
            </button>
          </div>
        ))}
      </div>

      {mostrarCarrinho && (
        <div className="bg-white border-2 border-green-500 rounded-xl p-6 shadow-2xl w-full max-w-md fixed bottom-4 right-4 z-50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Seu Pedido</h2>
            <div className="flex items-center space-x-2">
              {carrinho.length > 0 && (
                <button 
                  onClick={limparCarrinho}
                  className="text-gray-400 hover:text-red-600 text-sm flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-lg transition-colors"
                  title="Limpar carrinho"
                >
                  🗑️ Limpar
                </button>
              )}
              <button 
                onClick={() => setMostrarCarrinho(false)}
                className="text-gray-400 hover:text-gray-800 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>
          </div>
          
          {carrinho.length === 0 ? (
            <p className="text-gray-500 mb-2">Seu carrinho está vazio.</p>
          ) : (
            <>
              <ul className="mb-4 max-h-40 overflow-y-auto pr-2 space-y-3">
                {carrinho.map((item, index) => (
                  <li key={index} className="flex flex-col text-gray-800 border-b pb-2">
                    <div className="flex justify-between font-semibold items-start">
                      <div className="flex items-center">
                        <button 
                          onClick={() => removerDoCarrinho(item.id)}
                          className="text-red-400 hover:text-red-600 font-bold mr-2 text-sm px-1"
                          title="Remover item"
                        >
                          ✕
                        </button>
                        <span>{item.nome}</span>
                      </div>
                      <span>R$ {(item.preco * item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1 ml-6">
                      <span className="text-sm text-gray-500">
                        Valor un. R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <div className="flex items-center space-x-3 bg-gray-100 rounded-lg px-2 py-1">
                        <button 
                          onClick={() => diminuirQuantidade(item.id)}
                          className="text-gray-600 hover:text-red-500 font-bold px-2"
                        >
                          -
                        </button>
                        <span className="text-sm font-bold">{item.quantidade}</span>
                        <button 
                          onClick={() => adicionarAoCarrinho(item)}
                          className="text-gray-600 hover:text-green-500 font-bold px-2"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="flex justify-between items-center mb-6 pt-2">
                <span className="text-lg text-gray-600">Total Final:</span>
                <span className="text-2xl font-bold text-green-600">R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              <button 
                onClick={finalizarPedido}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-600 transition-colors shadow-md"
              >
                Finalizar no WhatsApp 📲
              </button>
            </>
          )}
        </div>
      )}
    </main>
  );
}