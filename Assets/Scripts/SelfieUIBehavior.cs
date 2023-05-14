using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class SelfieUIBehavior : MonoBehaviour
{
    public Sprite _selfieSprite;
    public string _text;

    private void OnMouseOver()
    {
        SelfiePanelBehavior.SetSprite(_selfieSprite);
        SelfiePanelBehavior.SetText(_text);
    }
}
