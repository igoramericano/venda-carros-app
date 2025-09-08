export async function UploadFile({ file }) {
  console.log(`Simulando upload do arquivo: ${file.name}`);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    file_url: `https://via.placeholder.com/800x600.png?text=${file.name.replace(/\s/g, '+')}`
  };
}