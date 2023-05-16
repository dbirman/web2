using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.Rendering;

public class SceneController : MonoBehaviour
{
    [SerializeField] GameObject _brainCardsGO;
    [SerializeField] GameObject _earthGO;

    [SerializeField] Camera _mainCamera;

#if UNITY_EDITOR
    private void Awake()
    {
        ChangeScene(1);
    }
#endif

    public void ChangeScene(int earth)
    {
        _earthGO.SetActive(earth == 1);
        _brainCardsGO.SetActive(earth != 1);

        Vector3 pos = _mainCamera.transform.localPosition;

        pos.x = earth == 1 ? 40f : 0f;

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
