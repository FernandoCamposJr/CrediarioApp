import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { inicializarBanco, usarBanco } from '../../src/database/database';

type Cliente = {
  id: number;
  nome: string;
  cpf?: string;
  telefone?: string;
  valor_divida?: number;
  data_compra?: string;
  endereco?: string;
}

export default function Index() {
  const router = useRouter();
  const db = usarBanco();
  
  const [clientes, setClientes] = useState<Cliente[]>([]); 
  const [totalReceber, setTotalReceber] = useState(0);
  const [textoBusca, setTextoBusca] = useState('');

  const listarClientes = async () => {
    try {
      const resultado = await db.getAllAsync('SELECT * FROM clientes');
      const lista = resultado as Cliente[];
      setClientes(lista);

      const soma = lista.reduce((acumulador, item) => {
        return acumulador + (item.valor_divida || 0);
      }, 0);
      setTotalReceber(soma);

    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      inicializarBanco(); 
      listarClientes();   
    }, [])
  );

  const clientesFiltrados = clientes.filter((cliente) => 
    cliente.nome.toLowerCase().includes(textoBusca.toLowerCase())
  );

  const calcularDiasAtraso = (dataString?: string) => {
    if (!dataString) return 0;
    const dataLimpa = dataString.replace(/[-.]/g, '/');
    const partes = dataLimpa.split('/');
    if (partes.length !== 3) return 0;
    
    const dia = Number(partes[0]);
    const mes = Number(partes[1]) - 1; 
    const ano = Number(partes[2]);
    const anoCorrigido = ano < 100 ? 2000 + ano : ano;

    const dataCompra = new Date(anoCorrigido, mes, dia);
    const hoje = new Date();
    const diferencaTempo = hoje.getTime() - dataCompra.getTime();
    return Math.ceil(diferencaTempo / (1000 * 3600 * 24));
  };

  const obterCorStatus = (data?: string) => {
    const dias = calcularDiasAtraso(data);
    return dias > 30 ? '#ff4d4d' : '#00e676';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.titulo}>Carteira de Clientes</Text>

      {/* Painel Financeiro */}
      <View style={styles.painelTotal}>
        <Text style={styles.painelTitulo}>TOTAL A RECEBER</Text>
        <Text style={styles.painelValor}>R$ {totalReceber.toFixed(2)}</Text>
      </View>

      {/* Busca */}
      <TextInput 
        style={styles.inputBusca}
        placeholder="🔍 Pesquisar cliente..."
        placeholderTextColor="#777"
        value={textoBusca}
        onChangeText={setTextoBusca}
      />

      <FlatList
        data={clientesFiltrados}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={{color: '#777', textAlign: 'center', marginTop: 20}}>Nenhum cliente encontrado.</Text>}
        renderItem={({ item }) => {
          const diasAtraso = calcularDiasAtraso(item.data_compra);

          return (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => router.push(`/cadastro?id=${item.id}`)}
            >
              <View>
                <Text style={[styles.nome, { color: obterCorStatus(item.data_compra) }]}>
                  {item.nome}
                </Text>
                <Text style={styles.valor}>R$ {item.valor_divida ? item.valor_divida.toFixed(2) : '0.00'}</Text>
              </View>
              
              <View style={styles.ladoDireito}>
                <Text style={styles.dias}>{diasAtraso}</Text>
                <Text style={styles.legenda}>dias</Text>
              </View>
            </TouchableOpacity>
          )
        }}
      />
      
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/cadastro')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// AQUI ESTAVA FALTANDO O CONTEÚDO:
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 60, paddingHorizontal: 20 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  
  painelTotal: {
    backgroundColor: '#0066cc',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 5,
  },
  painelTitulo: { color: '#rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' },
  painelValor: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 5 },

  inputBusca: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 15,
    fontSize: 16,
  },

  card: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  nome: { fontSize: 18, fontWeight: 'bold' },
  valor: { color: '#ccc', fontSize: 16, marginTop: 4 },
  ladoDireito: { alignItems: 'center' },
  dias: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  legenda: { color: '#777', fontSize: 12 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, backgroundColor: '#0066cc', borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  fabText: { color: '#fff', fontSize: 30, marginTop: -4 }
});