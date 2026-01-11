import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usarBanco } from '../src/database/database';

export default function Detalhes() {
  const router = useRouter();
  const params = useLocalSearchParams(); // Aqui pegamos os dados enviados da outra tela
  const db = usarBanco();

  const excluirCliente = async () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja apagar essa dívida?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "SIM, APAGAR", 
          style: 'destructive',
          onPress: async () => {
            try {
              await db.runAsync('DELETE FROM clientes WHERE id = ?', [Number(params.id)]);
              router.back(); // Volta para a tela inicial
            } catch (error) {
              console.log(error);
              Alert.alert('Erro', 'Não foi possível excluir.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Detalhes da Dívida</Text>

      <View style={styles.cartao}>
        <Text style={styles.label}>Cliente</Text>
        <Text style={styles.valorGrande}>{params.nome}</Text>

        <Text style={styles.label}>Valor Devido</Text>
        <Text style={[styles.valorGrande, { color: '#ff4d4d' }]}>
          R$ {Number(params.valor_divida).toFixed(2)}
        </Text>

        <Text style={styles.label}>Telefone</Text>
        <Text style={styles.info}>{params.telefone}</Text>

        <Text style={styles.label}>Data da Compra</Text>
        <Text style={styles.info}>{params.data_compra}</Text>
        
        <Text style={styles.label}>Endereço</Text>
        <Text style={styles.info}>{params.endereco}</Text>
      </View>

      <TouchableOpacity style={styles.botaoExcluir} onPress={excluirCliente}>
        <Text style={styles.textoBotao}>DAR BAIXA / EXCLUIR</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.back()}>
        <Text style={styles.textoVoltar}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, paddingTop: 60 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  cartao: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#333' },
  label: { color: '#777', fontSize: 14, marginTop: 15 },
  valorGrande: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  info: { color: '#ccc', fontSize: 18 },
  botaoExcluir: { backgroundColor: '#ff4d4d', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  textoBotao: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  botaoVoltar: { padding: 15, alignItems: 'center', marginTop: 10 },
  textoVoltar: { color: '#ccc', fontSize: 16 }
});