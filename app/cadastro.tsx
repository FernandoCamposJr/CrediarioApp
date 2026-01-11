import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Importações do Firebase
import { addDoc, collection, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../src/database/database';

export default function Cadastro() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [valor, setValor] = useState('');
  const [dataCompra, setDataCompra] = useState('');
  const [endereco, setEndereco] = useState('');
  const [carregando, setCarregando] = useState(false);

  const formatarCPF = (texto: string) => {
    let v = texto.replace(/\D/g, ''); 
    v = v.replace(/(\d{3})(\d)/, '$1.$2'); 
    v = v.replace(/(\d{3})(\d)/, '$1.$2'); 
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); 
    setCpf(v);
  };

  const formatarTelefone = (texto: string) => {
    let v = texto.replace(/\D/g, '');
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2'); 
    v = v.replace(/(\d)(\d{4})$/, '$1-$2'); 
    setTelefone(v);
  };

  const formatarData = (texto: string) => {
    let v = texto.replace(/\D/g, '');
    v = v.replace(/(\d{2})(\d)/, '$1/$2'); 
    v = v.replace(/(\d{2})(\d)/, '$1/$2'); 
    if (v.length > 10) v = v.substring(0, 10);
    setDataCompra(v);
  };

  const formatarValor = (texto: string) => {
    setValor(texto);
  };

  const cobrarNoZap = () => {
    if (!telefone) {
      Alert.alert('Erro', 'Este cliente não tem telefone cadastrado!');
      return;
    }
    const numeroLimpo = telefone.replace(/\D/g, '');
    const mensagem = `Olá ${nome}, tudo bem? Estou entrando em contato referente ao seu débito de R$ ${valor} no Crediário.`;
    const link = `whatsapp://send?phone=55${numeroLimpo}&text=${mensagem}`;
    Linking.openURL(link).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.');
    });
  };

  useEffect(() => {
    if (id) {
      const carregarDados = async () => {
        try {
          const docRef = doc(db, "clientes", id as string);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const cliente = docSnap.data();
            setNome(cliente.nome);
            setCpf(cliente.cpf || '');
            setTelefone(cliente.telefone || '');
            setValor(String(cliente.valor_divida));
            setDataCompra(cliente.data_compra || '');
            setEndereco(cliente.endereco || '');
          }
        } catch (erro) {
          console.log(erro);
          Alert.alert("Erro", "Falha ao carregar cliente.");
        }
      };
      carregarDados();
    }
  }, [id]);

  const salvar = async () => {
    if (!nome || !valor) {
      Alert.alert('Erro', 'Nome e Valor são obrigatórios!');
      return;
    }
    setCarregando(true);
    const valorCorrigido = Number(valor.replace(',', '.'));
    try {
      if (id) {
        await updateDoc(doc(db, "clientes", id as string), {
          nome, cpf, telefone, endereco, 
          valor_divida: valorCorrigido, 
          data_compra: dataCompra
        });
        Alert.alert('Sucesso', 'Dados atualizados na nuvem!');
      } else {
        await addDoc(collection(db, "clientes"), {
          nome, cpf, telefone, endereco, 
          valor_divida: valorCorrigido, 
          data_compra: dataCompra
        });
        Alert.alert('Sucesso', 'Cliente salvo na nuvem!');
      }
      router.back(); 
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Erro ao salvar no Google.');
    } finally {
      setCarregando(false);
    }
  };

  const excluir = async () => {
    try {
      await deleteDoc(doc(db, "clientes", id as string));
      Alert.alert('Excluído', 'Cliente removido.');
      router.back();
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Erro ao excluir.');
    }
  };
// ... CONTINUA NA PARTE 2


return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100} 
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <Text style={styles.titulo}>{id ? 'Editar Cliente' : 'Novo Cliente'}</Text>

          <Text style={styles.label}>Nome Completo</Text>
          <TextInput style={styles.input} value={nome} placeholderTextColor="#777" onChangeText={setNome} />

          <Text style={styles.label}>CPF</Text>
          <TextInput style={styles.input} value={cpf} placeholder="000.000.000-00" placeholderTextColor="#777" keyboardType="numeric" maxLength={14} onChangeText={formatarCPF} />

          <Text style={styles.label}>Telefone</Text>
          <TextInput style={styles.input} value={telefone} placeholder="(00) 00000-0000" placeholderTextColor="#777" keyboardType="phone-pad" maxLength={15} onChangeText={formatarTelefone} />

          <View style={styles.row}>
            <View style={styles.coluna}>
              <Text style={styles.label}>Valor (R$)</Text>
              <TextInput style={styles.input} value={valor} placeholder="0.00" keyboardType="numeric" placeholderTextColor="#777" onChangeText={formatarValor} />
            </View>
            <View style={styles.coluna}>
              <Text style={styles.label}>Data</Text>
              <TextInput style={styles.input} value={dataCompra} placeholder="DD/MM/AAAA" keyboardType="numeric" maxLength={10} placeholderTextColor="#777" onChangeText={formatarData} />
            </View>
          </View>

          <Text style={styles.label}>Endereço</Text>
          <TextInput style={[styles.input, styles.inputEndereco]} value={endereco} multiline={true} placeholderTextColor="#777" onChangeText={setEndereco} />

          <TouchableOpacity style={styles.botaoSalvar} onPress={salvar} disabled={carregando}>
            <Text style={styles.textoBotao}>{carregando ? 'SALVANDO...' : (id ? 'ATUALIZAR DADOS' : 'SALVAR NO FIREBASE')}</Text>
          </TouchableOpacity>

          {id && (
            <TouchableOpacity style={styles.botaoZap} onPress={cobrarNoZap}>
              <Text style={styles.textoBotao}>📲 COBRAR NO WHATSAPP</Text>
            </TouchableOpacity>
          )}

          {id && (
            <TouchableOpacity style={styles.botaoExcluir} onPress={excluir}>
              <Text style={styles.textoBotao}>EXCLUIR CLIENTE</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.back()}>
            <Text style={styles.textoVoltar}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: '#121212' },
  container: { flex: 1, padding: 20, paddingTop: 40 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 30, textAlign: 'center' },
  label: { color: '#ccc', marginBottom: 5, fontSize: 16 },
  input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 15, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#333', fontSize: 16 },
  inputEndereco: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  coluna: { width: '48%' },
  botaoSalvar: { backgroundColor: '#0066cc', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  botaoZap: { backgroundColor: '#25D366', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  botaoExcluir: { backgroundColor: '#ff4d4d', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  textoBotao: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  botaoVoltar: { padding: 15, alignItems: 'center', marginTop: 10 },
  textoVoltar: { color: '#ccc', fontSize: 16 }
});