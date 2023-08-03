using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.AddressableAssets;

public class SceneController : MonoBehaviour
{
    [SerializeField] GameObject _brainCardsGO;
    [SerializeField] GameObject _earthGO;

    [SerializeField] Camera _mainCamera;
    public static bool IsEarth;

#if UNITY_EDITOR
    public bool LoadEarth;

    private void Awake()
    {
        if (LoadEarth)
            ChangeScene(true);
    }
#endif

    public void ChangeScene(bool earth)
    {
        IsEarth = earth;

        _earthGO.SetActive(IsEarth);
        _brainCardsGO.SetActive(!IsEarth);


        Vector3 pos = _mainCamera.transform.localPosition;

        pos.x = IsEarth ? 40f : 0f;

        _mainCamera.transform.localPosition = pos;

        LoadHighRes();
    }

    public async void LoadHighRes()
    {
        if (Screen.width > 2000f)
        {
            Debug.Log("Loading high resolution textures");
            var earthLoader = Addressables.LoadAssetAsync<Texture2D>("Assets/AddressableAssets/earth/Earth_color_shadow.png");
            var shadowLoader = Addressables.LoadAssetAsync<Texture2D>("Assets/AddressableAssets/earth/Earth_night_cloud.png");

            await Task.WhenAll(new Task[] { earthLoader.Task, shadowLoader.Task });

            _earthGO.GetComponent<Renderer>().material.SetTexture("_DiffuseTex", earthLoader.Result);
            _earthGO.GetComponent<Renderer>().material.SetTexture("_CloudAndNightTex", shadowLoader.Result);

            Debug.Log("Loaded");
        }
    }
}
