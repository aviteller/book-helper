export const slugify = (str:string): string => {
    let returnString:string;
//needs more work
    returnString = str.replaceAll(/[^a-zA-Z0-9]/g, ' ');
    returnString = returnString.trim()
    returnString = returnString.replaceAll(" ", "-");
    returnString = returnString.replaceAll("--", "-");
    returnString = returnString.toLocaleLowerCase();


    return returnString
}