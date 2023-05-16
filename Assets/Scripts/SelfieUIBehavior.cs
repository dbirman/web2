using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.UI;

public class SelfieUIBehavior : MonoBehaviour
{
    private Sprite _selfieSprite;
    public string _spriteName;
    public string _text;

    private bool loading;

    private void OnMouseOver()
    {
        SelfiePanelBehavior.SetText(_text);
        SetAndLoadSprite();
    }

    private async void SetAndLoadSprite()
    {
        if (loading)
            return;

        if (_selfieSprite == null)
        {
            loading = true;
            Debug.Log($"Loading {_spriteName}");
            var spriteLoader = Addressables.LoadAssetAsync<Sprite>($"Assets/AddressableAssets/images/{_spriteName}.jpg[{_spriteName}]");
            await spriteLoader.Task;

            _selfieSprite = spriteLoader.Result;
        }
        loading = false;

        SelfiePanelBehavior.SetSprite(_selfieSprite);
    }
}
