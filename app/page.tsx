"use client";

import { useState, useEffect, MouseEvent } from 'react';

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  referencia: string;
  preco: number;
  imagens: string[];
}

interface CarrinhoItem extends Produto {
  quantidade: number;
}

// --- COMPONENTE: Card de Produto com Carrossel Manual ---
const ProdutoCard = ({ produto, adicionarAoCarrinho }: { produto: Produto, adicionarAoCarrinho: (p: Produto) => void }) => {
  const [indiceFoto, setIndiceFoto] = useState(0);

  const proximaFoto = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIndiceFoto((prev) => (prev === produto.imagens.length - 1 ? 0 : prev + 1));
  };

  const fotoAnterior = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIndiceFoto((prev) => (prev === 0 ? produto.imagens.length - 1 : prev - 1));
  };

  return (
    <div className="bg-white border p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col group">
      
      <div className="relative h-48 w-full mb-4 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center">
        <img 
          src={produto.imagens[indiceFoto]} 
          alt={`${produto.nome} - Foto ${indiceFoto + 1}`}
          className="absolute inset-0 h-full w-full object-cover transition-all duration-300"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://via.placeholder.com/500?text=Erro+na+Foto" }}
        />
        
        {produto.imagens.length > 1 && (
          <>
            <button 
              onClick={fotoAnterior}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-7 h-7 rounded-full flex justify-center items-center text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              &#10094;
            </button>
            
            <button 
              onClick={proximaFoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-7 h-7 rounded-full flex justify-center items-center text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              &#10095;
            </button>

            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
              {produto.imagens.map((_, index: number) => (
                <div 
                  key={index} 
                  className={`h-1.5 rounded-full transition-all shadow-sm ${
                    index === indiceFoto ? 'w-3 bg-gray-800' : 'w-1.5 bg-gray-300/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className="flex-grow">
        <h2 className="text-lg font-semibold text-gray-700">{produto.nome}</h2>
        <p className="text-sm text-gray-400 mb-2">{produto.categoria} | Ref: {produto.referencia}</p>
        <p className="text-xl font-bold text-green-600 mb-4">
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
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function Home() {
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");
  
  const [termoBusca, setTermoBusca] = useState("");
  
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);

  const numeroWhatsApp = "5548998445112"; 

  const removerAcentos = (texto: string) => {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  useEffect(() => {
    const carregarPlanilha = async () => {
      try {
        const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRYE6JPgdDHYWWMf7l4owsGL2wCSFV18861ZiKv2ae_ooALvxTI5YVLtTXjLg5cKA2ljtoDa_u1GdG2/pub?output=csv";
        const resposta = await fetch(url);
        const dadosCsv = await resposta.text();
        const linhas = dadosCsv.split(/\r?\n/);
        const produtosCarregados: Produto[] = [];

        for (let i = 1; i < linhas.length; i++) {
          if (!linhas[i].trim()) continue;

          const colunas = linhas[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          const limparTexto = (texto: string) => texto ? texto.replace(/(^"|"$)/g, '').trim() : '';

          const ativo = limparTexto(colunas[5]).toUpperCase();

          if (ativo === 'SIM' || ativo === 'TRUE' || ativo === '1') {
            const valorRaw = limparTexto(colunas[4]);
            const precoFormatado = parseFloat(valorRaw.replace(',', '.'));
            
            const linksBrutos = limparTexto(colunas[6]);
            const arrayFotos = linksBrutos
              .split('|')
              .map(img => img.trim())
              .filter(img => img !== "" && img !== "Foto não encontrada");

            produtosCarregados.push({
              id: limparTexto(colunas[0]),
              nome: limparTexto(colunas[1]),
              categoria: limparTexto(colunas[2]) || "Geral",
              referencia: limparTexto(colunas[3]),
              preco: isNaN(precoFormatado) ? 0 : precoFormatado,
              imagens: arrayFotos.length > 0 ? arrayFotos : ["https://drive.google.com/file/d/15E3hHHCBFRyL-AOXCV0NJ5MMGLhnZGBZ/view?usp=sharing"]
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

  const categorias = ["Todas", ...Array.from(new Set(produtos.map((p) => p.categoria)))];

  const produtosFiltrados = produtos.filter((p) => {
    const matchCategoria = categoriaSelecionada === "Todas" || p.categoria === categoriaSelecionada;
    
    const buscaLimpa = removerAcentos(termoBusca.toLowerCase());
    const nomeLimpo = removerAcentos(p.nome.toLowerCase());
    const refLimpa = removerAcentos(p.referencia.toLowerCase());

    const matchBusca = termoBusca === "" || 
      nomeLimpo.includes(buscaLimpa) || 
      refLimpa.includes(buscaLimpa);

    return matchCategoria && matchBusca;
  });

  const adicionarAoCarrinho = (produto: Produto) => {
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

    const itensAtivos: CarrinhoItem[] = [];
    const itensInativos: CarrinhoItem[] = [];

    carrinho.forEach((item) => {
      const aindaAtivo = produtos.some((p) => p.id === item.id);
      if (aindaAtivo) {
        itensAtivos.push(item);
      } else {
        itensInativos.push(item);
      }
    });

    if (itensInativos.length > 0) {
      const nomesInativos = itensInativos.map((i) => i.nome).join(', ');
      alert(`⚠️ Atenção: O(s) seguinte(s) item(ns) ficou(aram) inativo(s) ou indisponível(is) e foi(ram) removido(s) do seu carrinho:\n\n${nomesInativos}`);
      
      setCarrinho(itensAtivos);
      return;
    }

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

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="mt-4 text-xl font-bold text-gray-700">Carregando Coleção...</h2>
      </div>
    );
  }

  if (!carregando && produtos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h2 className="mt-4 text-2xl font-bold text-gray-700">Nenhum produto ativo encontrado.</h2>
        <p className="text-gray-500 mt-2">Adicione produtos na planilha e marque a coluna Ativo como SIM.</p>
      </div>
    );
  }

  return (
    /* Página principal */
    <main className="p-8 font-sans max-w-5xl mx-auto bg-gray-50 min-h-screen relative">

      <div className="bg-green-500 text-white p-4 rounded-xl mb-8 shadow-md flex items-center justify-center">
        <p className="text-lg font-semibold">
          🌟 Confira nossa nova coleção de roupas! Aproveite as ofertas e novidades. 🌟
        </p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Nossa Coleção 👗</h1>
        <button 
          onClick={() => setMostrarCarrinho(!mostrarCarrinho)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-gray-700 transition-colors cursor-pointer"
        >
          🛒 {quantidadeTotalItens} {quantidadeTotalItens === 1 ? 'peça' : 'peças'}
        </button>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 text-lg">🔍</span>
        </div>
        <input
          type="text"
          placeholder="Buscar produto por nome ou referência..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
        />
        {termoBusca && (
          <button 
            onClick={() => setTermoBusca("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 font-bold"
          >
            ✕
          </button>
        )}
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
      
      {produtosFiltrados.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">Ops! Nenhum produto encontrado com "{termoBusca}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {produtosFiltrados.map((produto) => (
            <ProdutoCard 
              key={produto.id} 
              produto={produto} 
              adicionarAoCarrinho={adicionarAoCarrinho} 
            />
          ))}
        </div>
      )}

      {mostrarCarrinho && (
        <div className="bg-white border-2 border-green-500 rounded-xl p-6 shadow-2xl w-full max-w-md fixed bottom-4 right-4 z-50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Seu Pedido</h2>
            <div className="flex items-center space-x-2">
              {carrinho.length > 0 && (
                <button 
                  onClick={limparCarrinho}
                  className="text-gray-400 hover:text-red-600 text-sm flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-lg transition-colors"
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