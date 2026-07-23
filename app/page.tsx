"use client";

import { useState, useEffect } from 'react';

export default function Home() {
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  // NOVA MEMÓRIA: Guarda a categoria que está selecionada no momento. Começa com "Todas".
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");

  const numeroWhatsApp = "5548998445112"; 

  const produtos = [
    { 
      id: 1, 
      nome: "Camiseta Básica Branca", 
      preco: 49.90, 
      categoria: "Camisetas", 
      imagem: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80" 
    },
    { 
      id: 2, 
      nome: "Calça Jeans Skinny", 
      preco: 129.90, 
      categoria: "Calças", 
      imagem: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80" 
    },
    { 
      id: 3, 
      nome: "Vestido de Verão Floral", 
      preco: 159.90, 
      categoria: "Vestidos", 
      imagem: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80" 
    },
    { 
      id: 4, 
      nome: "Jaqueta de Couro Fake", 
      preco: 249.90, 
      categoria: "Casacos", 
      imagem: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80" 
    }
  ];

  // --- INÍCIO DA LÓGICA DO FILTRO ---
  
  // 1. Cria uma lista automática com o nome das categorias (sem repetir) e adiciona o botão "Todas"
  const categorias = ["Todas", ...Array.from(new Set(produtos.map((p) => p.categoria)))];

  // 2. Filtra os produtos. Se for "Todas", mostra tudo. Se não, mostra só os da categoria clicada.
  const produtosFiltrados = categoriaSelecionada === "Todas" 
    ? produtos 
    : produtos.filter((p) => p.categoria === categoriaSelecionada);

  // --- FIM DA LÓGICA DO FILTRO ---

  // --- NOVA LÓGICA DE AGRUPAMENTO ---
  const adicionarAoCarrinho = (produto: any) => {
    // 1. Procura se o item já existe no carrinho atual
    const itemExistente = carrinho.find((item) => item.id === produto.id);

    if (itemExistente) {
      // 2. Se existe, criamos um carrinho novo somando +1 na quantidade apenas dele
      const novoCarrinho = carrinho.map((item) => 
        item.id === produto.id 
          ? { ...item, quantidade: item.quantidade + 1 } 
          : item
      );
      setCarrinho(novoCarrinho);
    } else {
      // 3. Se não existe, adicionamos com a propriedade "quantidade: 1"
      setCarrinho([...carrinho, { ...produto, quantidade: 1 }]);
    }
  };
  // --- INÍCIO DO NOVO BLOCO LÓGICO ---

  // 1. Carrega o carrinho salvo no navegador assim que a página abre
  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('meu-catalogo-carrinho');
    if (carrinhoSalvo) {
      setCarrinho(JSON.parse(carrinhoSalvo));
    }
  }, []);

  // 2. Salva o carrinho no navegador toda vez que ele sofrer alguma alteração
  useEffect(() => {
    localStorage.setItem('meu-catalogo-carrinho', JSON.stringify(carrinho));
  }, [carrinho]);

  // 3. Função para diminuir itens (se chegar a zero, remove do carrinho)
  const diminuirQuantidade = (id: number) => {
    const novoCarrinho = carrinho.map((item) => {
      if (item.id === id) {
        return { ...item, quantidade: item.quantidade - 1 };
      }
      return item;
    }).filter((item) => item.quantidade > 0); // Mantém na lista só o que for maior que zero

    setCarrinho(novoCarrinho);
  };
  // 4. Função para remover o item completamente do carrinho
  const removerDoCarrinho = (id: number) => {
    const novoCarrinho = carrinho.filter((item) => item.id !== id);
    setCarrinho(novoCarrinho);
  };
  // 5.Função para esvaziar o carrinho completamente
  const limparCarrinho = () => {
    setCarrinho([]);
  };

  // --- FIM DO NOVO BLOCO LÓGICO ---
  // --- NOVOS CÁLCULOS ---
  // Calcula o valor total financeiro (Preço x Quantidade de cada linha)
  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  // Calcula a quantidade total de peças (para mostrar no botão do topo)
  const quantidadeTotalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);

  const finalizarPedido = () => {
    if (carrinho.length === 0) return;

    let texto = "Olá! Gostaria de fechar o seguinte pedido:\n\n";
    
    // Atualizamos a mensagem do WhatsApp para mostrar a Quantidade e o Subtotal daquela linha
    carrinho.forEach((item) => {
      const subtotalItem = item.preco * item.quantidade;
      texto += `🛍️ ${item.quantidade}x *${item.nome}* - R$ ${subtotalItem.toFixed(2)}\n`;
    });
    
    texto += `\n💰 *Total do Orçamento: R$ ${calcularTotal().toFixed(2)}*`;
    
    const textoCodificado = encodeURIComponent(texto);
    const link = `https://wa.me/${numeroWhatsApp}?text=${textoCodificado}`;
    
    window.open(link, '_blank');
  };

  return (
    <main className="p-8 font-sans max-w-5xl mx-auto bg-gray-50 min-h-screen relative">
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Nossa Coleção 👗</h1>
        
        <button 
          onClick={() => setMostrarCarrinho(!mostrarCarrinho)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-gray-700 transition-colors cursor-pointer"
        >
          {/* Atualizamos para usar a nova contagem de peças */}
          🛒 {quantidadeTotalItens} {quantidadeTotalItens === 1 ? 'peça' : 'peças'}
        </button>
      </div>
      
     {/* NOVO BLOCO: Botões de Filtro */}
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
      
      {/* ATUALIZADO: Trocamos "produtos.map" por "produtosFiltrados.map" */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {produtosFiltrados.map((produto) => (
          <div key={produto.id} className="bg-white border p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
            
            {/* NOVA LINHA: Aqui entra a foto real no lugar do quadrado cinza */}
            <img 
              src={produto.imagem} 
              alt={produto.nome}
              className="h-48 w-full object-cover mb-4 rounded-lg border border-gray-100"
            />
            
            <div className="flex-grow">
              <h2 className="text-lg font-semibold text-gray-700">{produto.nome}</h2>
              <p className="text-sm text-gray-400 mb-2">{produto.categoria}</p>
              <p className="text-xl font-bold text-green-600 mb-4">R$ {produto.preco.toFixed(2)}</p>
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
            
            {/* Bloco com o botão de Limpar Carrinho e o Fechar (X) */}
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
                    
                    {/* ATUALIZADO: O "X" para remover entrou aqui, ao lado do nome */}
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
                      <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1 ml-6">
                      <span className="text-sm text-gray-500">
                        Valor un. R$ {item.preco.toFixed(2)}
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
                <span className="text-2xl font-bold text-green-600">R$ {calcularTotal().toFixed(2)}</span>
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