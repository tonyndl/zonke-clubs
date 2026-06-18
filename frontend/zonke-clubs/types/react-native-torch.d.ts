declare module "react-native-torch" {
  const Torch: {
    switchState(state: boolean): Promise<boolean>;
    requestCameraPermission(title: string, message: string): Promise<boolean>;
  };
  export default Torch;
}
