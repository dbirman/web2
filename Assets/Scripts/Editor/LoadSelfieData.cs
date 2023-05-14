using UnityEditor;
using UnityEngine;

public class LoadSelfieData : MonoBehaviour
{

    [MenuItem("Tools/Convert Selfie CSV to GameObjects")]
    public static void ConvertCSV2GO()
    {
        TextAsset csvData = AssetDatabase.LoadAssetAtPath<TextAsset>("Assets/Data/ss.csv");
        var data = CSVReader.ParseText(csvData.text);

        GameObject rotator = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Prefabs/Rotator.prefab");

        Transform parentT = GameObject.Find("Selfies").transform;
        // clear all current children
        for (int i = parentT.childCount - 1; i >= 0; i--)
            DestroyImmediate(parentT.GetChild(i).gameObject);

        foreach (var row in data)
        {
            // Make a rotatable GameObject
            GameObject go = Instantiate(rotator, parentT);
            go.name = (string)row["name"];
            go.transform.rotation = Quaternion.Euler(90f - (float)row["x"], -(float)row["y"], 0f);

            SelfieUIBehavior selfieUIBehavior = go.GetComponentInChildren<SelfieUIBehavior>();
            selfieUIBehavior._selfieSprite = AssetDatabase.LoadAssetAtPath<Sprite>($"Assets/Data/images/{row["image"]}.jpg");
            selfieUIBehavior._text = (string)row["name"];
        }
    }
}
