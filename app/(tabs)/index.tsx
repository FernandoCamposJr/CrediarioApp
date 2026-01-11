import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Importando o Firebase
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../src/database/database';

type Cliente = {
  id: string; // No Firebase, o ID é texto (ex: "A1b2C3d4")
  nome: string;
  valor_divida: number;
  data_compra: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [total, setTotal] = useState(0);

  // --- O "OUVIDO" DO FIREBASE (TEMPO REAL) ---
  useEffect(() => {
    // 1. Cria a consulta (Busque na coleção 'clientes', ordenado por nome)
    const q = query(collection(db, "clientes"), orderBy("nome", "asc"));

    // 2. Liga o listener (fofoqueiro)
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaTemp: Cliente[] = [];
      let somaTemp = 0;

      snapshot.forEach((doc) => {
        const dados = doc.data();
        listaTemp.push({
          id: doc.id, // Pega o ID do documento
          nome: dados.nome,
          valor_divida: Number(dados.valor_divida),
          data_compra: dados.data_compra
        });
        somaTemp += Number(dados.valor_divida || 0);
      });

      setClientes(listaTemp);
      setTotal(somaTemp);
    });

    // 3. Desliga o listener quando sair da tela (para economizar bateria)
    return () => unsubscribe();
  }, []);

  // --- FUNÇÃO DE EXCLUIR ---
  const excluir = (id: string) => {
    Alert.alert('Excluir', 'Tem certeza?', [
      { text: 'Não', style: 'cancel' },
      { 
        text: 'Sim', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "clientes", id));
            // Não precisa atualizar a lista manualmente, o onSnapshot faz isso!
          } catch (erro) {
            console.log(erro);
            Alert.alert("Erro", "Não foi possível excluir.");
          }
        }
      }
    ]);
  };

  // --- LÓGICA DE COR (VERMELHO SE PASSOU DE 30 DIAS) ---
  const verificarAtraso = (dataString: string) => {
    if (!dataString) return false;
    const [dia, mes, ano] = dataString.split('/').map(Number);
    const dataCompra = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    const diferenca = hoje.getTime() - dataCompra.getTime();
    const dias = diferenca / (1000 * 3600 * 24);
    return dias > 30;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Crediário</Text>
        <Text style={styles.subtitulo}>Total a Receber</Text>
        <Text style={styles.valorTotal}>
          {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Text>
      </View>

      <FlatList 
        data={clientes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum cliente devendo! 🎉</Text>
        }
        renderItem={({ item }) => {
          const estaAtrasado = verificarAtraso(item.data_compra);
          return (
            <TouchableOpacity 
              style={[styles.card, estaAtrasado && styles.cardAtrasado]} 
              onPress={() => router.push(`/cadastro?id=${item.id}`)}
              onLongPress={() => excluir(item.id)}
            >
              <View style={styles.info}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.data}>{item.data_compra}</Text>
              </View>
              <Text style={styles.valor}>
                {item.valor_divida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/cadastro')}>
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, paddingTop: 50 },
  header: { alignItems: 'center', marginBottom: 30 },
  titulo: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  subtitulo: { color: '#888', fontSize: 14, marginTop: 5 },
  valorTotal: { color: '#4caf50', fontSize: 32, fontWeight: 'bold', marginTop: 5 },
  vazio: { color: '#555', textAlign: 'center', marginTop: 50, fontSize: 16 },
  card: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 12, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  cardAtrasado: { borderColor: '#ff4444', borderWidth: 1, backgroundColor: '#2a1a1a' },
  info: { flex: 1 },
  nome: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  data: { color: '#888', fontSize: 14 },
  valor: { color: '#eee', fontSize: 18, fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#0066cc', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 2 } }
});