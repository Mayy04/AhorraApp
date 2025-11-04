import { Dimensions, StyleSheet } from 'react-native';
const {width, height}=Dimensions.get('window');
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#009c5bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container2: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container3: {
    marginTop:'30%',
    flex:1,
    alignItems:'center',
    gap:10,
  },
  container4: {
    flex: 1,
    alignItems: "center",
    marginTop: height * 0.25, 
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    padding: 10,
    marginBottom: 10,
    width: '60%',
    backgroundColor: '#fff',
    borderRadius:10,
  },
  texto: {
    color: '#000000',
    fontSize: 30,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  texto2: {
    color: '#000000',
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  texto3: {
    color: '#BEFFE0',
    fontSize: 15,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  texto4: {
    color: '#FFDD00',
    fontSize: 15,
    marginBottom: 10,
  },
  texto5: {
    color: '#ffffffff',
    fontSize: 30,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  logo: {
    width: 85,
    height: 85,
    marginTop: '30%',
  },
  logo2: {
    width:width * 0.25,
    height:height * 0.06,
    marginBottom: 5,
  },
   lineaHorizontal: {
    height: 1,
    width: '80%', 
    backgroundColor: '#fff',
  },
  botones:{
    backgroundColor:'#00D162',
    paddingVertical:10,
    paddingHorizontal:25,
    borderRadius:8,
    marginBottom:30,
    marginTop:10,
    width: '60%',
  },
  botones2:{
    backgroundColor:'#009c5bff',
    paddingVertical:10,
    paddingHorizontal:25,
    borderRadius:8,
    marginBottom:20,
    width: '60%',
    alignItems: 'center',
  },
  botones3:{
    backgroundColor:'#00D162',
    paddingVertical:5,
    paddingHorizontal:70,
    borderRadius:8,
    width: '90%',
  },
  textoBoton:{
    color:'#fff',
    fontSize:16,
    fontWeight:'600',
    textAlign:'center',
  },
  espacioBlanco:{
    fontSize:9
  },
  encabezadoBg:{
    position: "absolute",
    top: 0,
    width: "100%",
    height: height * 0.60,
    zIndex: 0,
  },
  encabezado:{
flex: 1,
    flexDirection: "column",
    paddingTop: 60,
    paddingLeft: 25,
    alignItems: "flex-start",
  },
  imagen:{
    width: width * 0.85,
    height: height * 0.23,
    borderRadius: 10,
  },
  navbar:{
    position: "absolute",
    bottom: 0,
    width: "100%",
    height:height * 0.15,
    zIndex: 2,
    marginBottom:'5%'
  },
});
